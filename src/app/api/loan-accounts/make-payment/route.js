import prisma from "@/lib/prisma";
import { getCompanyId } from "@/utils/GetCompanyId";
import { NextResponse } from "next/server";

// Helper function for cash processing
const processCashPayment = async (body, companyId) => {
    const createTransactionData = () => ({
        amount: parseFloat(body.principalAmount),
        paymentType: body.paymentType,
        description: `Loan payment for ${body.accountId}`,
        type: 'LOAN_PAYMENT',
        date: new Date(body.date),
        companyId: companyId,
        loanAccountId: body.accountId
    });

    // Update CashAdjustment for principal payment
    await prisma.cashAdjustment.upsert({
        where: {
            userId: body.userId, // Assuming userId is available
        },
        update: {
            cashInHand: {
                increment: parseFloat(body.principalAmount),
            },
            transaction: {
                create: createTransactionData()
            }
        },
        create: {
            userId: body.userId,
            companyId: companyId,
            cashInHand: parseFloat(body.principalAmount),
            transaction: {
                create: createTransactionData()
            }
        },
    });

    // If there's interest, create separate transaction for interest
    if (body.interestAmount > 0) {
        await prisma.cashAdjustment.upsert({
            where: {
                userId: body.userId,
            },
            update: {
                cashInHand: {
                    increment: parseFloat(body.interestAmount),
                },
                transaction: {
                    create: {
                        amount: parseFloat(body.interestAmount),
                        paymentType: body.paymentType,
                        description: `Interest payment for loan account ${body.accountId}`,
                        type: 'LOAN_INTEREST',
                        date: new Date(body.date),
                        companyId: companyId,
                        loanAccountId: body.accountId
                    }
                }
            },
            create: {
                userId: body.userId,
                companyId: companyId,
                cashInHand: parseFloat(body.interestAmount),
                transaction: {
                    create: {
                        amount: parseFloat(body.interestAmount),
                        paymentType: body.paymentType,
                        description: `Interest payment for loan account ${body.accountId}`,
                        type: 'LOAN_INTEREST',
                        date: new Date(body.date),
                        companyId: companyId,
                        loanAccountId: body.accountId
                    }
                }
            },
        });
    }
};

// Helper function for bank processing
const processBankPayment = async (body, companyId) => {
    // You'll need to get the bank account ID based on payment type
    // This assumes paymentType contains the bank account display name
    const bankAccount = await prisma.cashAndBank.findFirst({
        where: {
            accountdisplayname: body.paymentType,
            companyId: companyId
        }
    });

    if (!bankAccount) {
        throw new Error(`Bank account "${body.paymentType}" not found`);
    }

    // Update bank account for principal payment
    await prisma.cashAndBank.update({
        where: {
            id: bankAccount.id
        },
        data: {
            openingbalance: {
                increment: parseFloat(body.principalAmount),
            },
            transaction: {
                create: {
                    amount: parseFloat(body.principalAmount),
                    paymentType: body.paymentType,
                    description: `Loan payment for ${body.accountId}`,
                    type: 'LOAN_PAYMENT',
                    date: new Date(body.date),
                    companyId: companyId,
                    loanAccountId: body.accountId
                }
            }
        }
    });

    // If there's interest, create separate transaction
    if (body.interestAmount > 0) {
        await prisma.cashAndBank.update({
            where: {
                id: bankAccount.id
            },
            data: {
                openingbalance: {
                    increment: parseFloat(body.interestAmount),
                },
                transaction: {
                    create: {
                        amount: parseFloat(body.interestAmount),
                        paymentType: body.paymentType,
                        description: `Interest payment for loan account ${body.accountId}`,
                        type: 'LOAN_INTEREST',
                        date: new Date(body.date),
                        companyId: companyId,
                        loanAccountId: body.accountId
                    }
                }
            }
        });
    }

    return bankAccount.id;
};

export async function PUT(request) {
    try {
        const body = await request.json();
        const companyId = await getCompanyId();



        // Verify loan account exists
        const loanAccount = await prisma.loanAccount.findFirst({
            where: {
                id: body.accountId,
                companyId: companyId
            }
        });

        if (!loanAccount) {
            return NextResponse.json(
                { error: 'Loan account not found' },
                { status: 404 }
            );
        }

        // Verify current balance is sufficient for payment
        if (parseFloat(body.totalAmount) > loanAccount.currentBalance) {
            return NextResponse.json(
                { error: 'Payment amount exceeds current loan balance' },
                { status: 400 }
            );
        }

        // Calculate new balance
        const newBalance = loanAccount.currentBalance - parseFloat(body.principalAmount);

        // Start transaction to ensure data consistency
        const result = await prisma.$transaction(async (prisma) => {
            // Update loan account balance
            const updatedLoanAccount = await prisma.loanAccount.update({
                where: {
                    id: body.accountId
                },
                data: {
                    currentBalance: newBalance
                }
            });

            // Process payment based on payment type
            if (body.paymentType === 'Cash') {
                // For cash payments, we need userId - you might need to adjust this
                // If userId is not in body, you might need to get it from context
                if (!body.userId) {
                    // You might want to get userId from session or request context
                    throw new Error('userId is required for cash payments');
                }
                await processCashPayment(body, companyId);
            } else {
                // For bank payments
                await processBankPayment(body, companyId);
            }

            // Create a summary transaction record if needed
            const transaction = await prisma.transaction.create({
                data: {
                    amount: parseFloat(body.totalAmount),
                    paymentType: body.paymentType,
                    description: `Loan payment - Principal: ${body.principalAmount}, Interest: ${body.interestAmount || 0}`,
                    type: 'LOAN_PAYMENT',
                    date: new Date(body.date),
                    companyId: companyId,
                    loanAccountId: body.accountId,
                    // You might want to add more fields as needed
                    name: `Payment for ${loanAccount.accountName}`,
                    status: 'COMPLETED'
                }
            });

            return { updatedLoanAccount, transaction };
        });
console.log("Payment processed successfully:", result);
        return NextResponse.json({
            status: true,
            message: "Payment processed successfully",
            data: {
                newBalance: result.updatedLoanAccount.currentBalance,
                transaction: result.transaction,
                accountDetails: {
                    accountName: loanAccount.accountName,
                    previousBalance: loanAccount.currentBalance
                }
            }
        });

    } catch (error) {
        console.error('Error processing payment:', error);
        return NextResponse.json(
            { error: error.message || "Failed to process payment" },
            { status: 500 }
        );
    }
}