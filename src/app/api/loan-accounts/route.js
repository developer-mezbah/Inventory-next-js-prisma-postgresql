import prisma from "@/lib/prisma";
import { getCompanyId } from "@/utils/GetCompanyId";
import { NextResponse } from "next/server";

// GET ALL
export async function GET() {
    try {
        const bank = await prisma.CashAndBank.findMany({
            orderBy: {
                id: 'desc',
            },
            where: {
                companyId: await getCompanyId(),
            },
        });
        const cash = await prisma.CashAdjustment.findMany({
            orderBy: {
                id: 'desc',
            },
            where: {
                companyId: await getCompanyId(),
            },
        });
        const accountData = await prisma.LoanAccount.findMany({
            orderBy: {
                id: 'desc',
            },
            where: {
                companyId: await getCompanyId(),
            },
            include: {
                transactions: true
            }
        });

        return NextResponse.json({ bank, cash, accountData });
    } catch (error) {
        return NextResponse.json({ error: error || "Failed to fetch Accounts Data" }, { status: 500 });
    }
}


const cashProcessing = async (body, companyId, processingFee = false, loanAccountId = "") => {
    // Create transaction data function
    const createTransactionData = () => ({
        amount: processingFee ? -parseFloat(body.processingFee) : parseFloat(body.currentBalance),
        paymentType: 'CASH',
        description: body.description || `Initial loan disbursement for ${body.accountName}`,
        type: processingFee ? 'LOAN_PROCESSING_FEE' : 'LOAN_DISBURSEMENT',
        date: new Date(),
        companyId: companyId,
        loanAccountId
    });


    const res = await prisma.cashAdjustment.upsert({
        where: {
            userId: body.userId,  // userId is @unique in your schema
        },
        update: {
            cashInHand: {
                [processingFee ? "decrement" : "increment"]: parseFloat(body.currentBalance),
            },
            transaction: {
                create: createTransactionData()
            }
        },
        create: {
            userId: body.userId,
            companyId: companyId,
            cashInHand: processingFee ? -parseFloat(body.processingFee) : parseFloat(body.currentBalance),
            transaction: {
                create: createTransactionData()
            }
        },
    });

    return res;
}

const bankProcessing = async (body, companyId, processingFee = false, loanAccountId = "") => {
    // Create transaction data function
    const createTransactionData = () => ({
        amount: processingFee ? -parseFloat(body.processingFee) : parseFloat(body.currentBalance),
        paymentType: processingFee ? body.processingFeePaidFrom?.accountdisplayname || "" : body.loanReceivedIn?.accountdisplayname || "",
        description: body.description || `Initial loan disbursement for ${body.accountName}`,
        type: processingFee ? 'LOAN_PROCESSING_FEE' : 'LOAN_DISBURSEMENT',
        date: new Date(),
        companyId: companyId,
        loanAccountId
    });

    // Fix: Get the correct value - use parseFloat for both cases but ensure it's positive
    const amount = processingFee ? parseFloat(body.processingFee) : parseFloat(body.currentBalance);

    const res = await prisma.cashAndBank.update({
        where: {
            id: processingFee ? body?.processingFeePaidFromId : body?.loanReceivedInId
        },
        data: {
            openingbalance: {
                [processingFee ? "decrement" : "increment"]: amount,
            },
            transaction: {
                create: createTransactionData()
            }
        }
    });

    return res;
}

// POST create new loan account
export async function POST(request) {
    try {
        const body = await request.json();
        const companyId = await getCompanyId();

        // Validation
        const requiredFields = ['accountName', 'currentBalance'];
        for (const field of requiredFields) {
            if (!body[field]) {
                return NextResponse.json(
                    { error: `${field} is required` },
                    { status: 400 }
                );
            }
        }

        // Check if account number already exists for this company
        if (body.accountNumber) {
            const existing = await prisma.loanAccount.findFirst({
                where: {
                    accountNumber: body.accountNumber,
                    companyId: companyId
                }
            });

            if (existing) {
                return NextResponse.json(
                    { error: 'Account number already exists for this company' },
                    { status: 409 }
                );
            }
        }



        // Create loan account
        const loanAccount = await prisma.loanAccount.create({
            data: {
                accountName: body.accountName,
                lenderBank: body.lenderBank,
                accountNumber: body.accountNumber,
                description: body.description,
                balanceAsOfDate: body.balanceAsOfDate ? new Date(body.balanceAsOfDate) : null,
                currentBalance: parseFloat(body.currentBalance),
                loanReceivedIn: body.loanReceivedIn?.accountdisplayname || body.loanReceivedIn || "Cash",
                loanReceivedId: body?.loanReceivedInId || "",
                processingFeePaidFrom: body.processingFeePaidFrom?.accountdisplayname || body.processingFeePaidFrom || "Cash",
                processingFeePaidFromId: body?.processingFeePaidFromId || "",
                interestRate: body.interestRate ? parseFloat(body.interestRate) : null,
                termDurationMonths: body.termDurationMonths ? parseInt(body.termDurationMonths) : null,
                processingFee: body.processingFee ? parseFloat(body.processingFee) : null,
                company: {
                    connect: { id: companyId }
                }
            }
        });

        if (loanAccount) {
            // Process loan processing fee first if applicable
            if (body?.processingFee > 0) {
                if (body?.processingFeePaidFrom === "Cash" || body.processingFeePaidFrom?.accountdisplayname === "Cash") {
                    await cashProcessing(body, companyId, true, loanAccount.id);
                } else {
                    await bankProcessing(body, companyId, true, loanAccount.id);
                }
            }

            // Process loan disbursement after processing fee
            if (body?.currentBalance > 0) {
                if (body?.loanReceivedIn === "Cash" || body.loanReceivedIn?.accountdisplayname === "Cash") {
                    await cashProcessing(body, companyId, false, loanAccount.id);
                } else {
                    await bankProcessing(body, companyId, false, loanAccount.id);
                }
            }
        }

        return NextResponse.json(
            {
                message: 'Loan account created successfully',
                data: loanAccount,
                status: true
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Error creating loan account:', error);
        return NextResponse.json(
            { error: 'Failed to create loan account' },
            { status: 500 }
        );
    }
}

// DELETE loan account with reversal of cash/bank entries
export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        
        if (!id) {
            return NextResponse.json(
                { error: 'Loan account ID is required' },
                { status: 400 }
            );
        }

        const companyId = await getCompanyId();

        // First, check if the loan account exists and belongs to the company
        const existingLoanAccount = await prisma.loanAccount.findFirst({
            where: {
                id: id, // id is String in your schema (cuid)
                companyId: companyId
            },
            include: {
                transactions: {
                    where: {
                        type: {
                            in: ['LOAN_DISBURSEMENT', 'LOAN_PROCESSING_FEE']
                        }
                    }
                }
            }
        });

        if (!existingLoanAccount) {
            return NextResponse.json(
                { error: 'Loan account not found or access denied' },
                { status: 404 }
            );
        }

        // Start a transaction to handle all related reversals and deletions
        const result = await prisma.$transaction(async (prisma) => {
            // Reverse cash/bank entries for each transaction
            for (const transaction of existingLoanAccount.transactions) {
                const isProcessingFee = transaction.type === 'LOAN_PROCESSING_FEE';
                const amount = Math.abs(transaction.amount || 0); // Get absolute value for reversal
                
                if (transaction.paymentType === 'CASH') {
                    // Find the cash adjustment record (assuming there's a default or specific user)
                    // Note: You might need to adjust this based on your business logic
                    const cashAdjustment = await prisma.cashAdjustment.findFirst({
                        where: {
                            companyId: companyId
                        }
                    });

                    if (cashAdjustment) {
                        // Reverse cash entry
                        await prisma.cashAdjustment.update({
                            where: {
                                id: cashAdjustment.id
                            },
                            data: {
                                cashInHand: {
                                    [isProcessingFee ? "increment" : "decrement"]: amount, // Reverse the original operation
                                },
                                transaction: {
                                    create: {
                                        amount: -(transaction.amount || 0), // Reverse the sign
                                        paymentType: 'CASH',
                                        description: `Reversal: ${transaction.description || 'Loan account deletion'}`,
                                        type: 'REVERSAL',
                                        date: new Date(),
                                        companyId: companyId,
                                        loanAccountId: id // Link reversal to loan account
                                    }
                                }
                            }
                        });
                    }
                } else {
                    // Reverse bank entry - find the bank account based on transaction paymentType
                    const bankAccount = await prisma.cashAndBank.findFirst({
                        where: {
                            accountdisplayname: transaction.paymentType,
                            companyId: companyId
                        }
                    });
                    
                    if (bankAccount) {
                        await prisma.cashAndBank.update({
                            where: {
                                id: bankAccount.id
                            },
                            data: {
                                openingbalance: {
                                    [isProcessingFee ? "increment" : "decrement"]: amount, // Reverse the original operation
                                },
                                transaction: {
                                    create: {
                                        amount: -(transaction.amount || 0),
                                        paymentType: transaction.paymentType,
                                        description: `Reversal: ${transaction.description || 'Loan account deletion'}`,
                                        type: 'REVERSAL',
                                        date: new Date(),
                                        companyId: companyId,
                                        loanAccountId: id // Link reversal to loan account
                                    }
                                }
                            }
                        });
                    }
                }
            }

            // Delete all related transactions
            if (existingLoanAccount.transactions.length > 0) {
                await prisma.transaction.deleteMany({
                    where: {
                        loanAccountId: id
                    }
                });
            }

            // Delete the loan account
            const deletedAccount = await prisma.loanAccount.delete({
                where: {
                    id: id
                }
            });

            return deletedAccount;
        });

        return NextResponse.json(
            {
                message: 'Loan account deleted successfully with all reversals',
                data: result,
                status: true
            },
            { status: 200 }
        );

    } catch (error) {
        console.error('Error deleting loan account:', error);
        
        // Handle specific Prisma errors
        if (error.code === 'P2025') {
            return NextResponse.json(
                { error: 'Loan account not found' },
                { status: 404 }
            );
        }
        
        return NextResponse.json(
            { error: 'Failed to delete loan account: ' + error.message },
            { status: 500 }
        );
    }
}