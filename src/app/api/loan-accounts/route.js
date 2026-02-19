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
                transactions: {
                    orderBy: {
                        id: 'desc'
                    },
                },
            },
        });

        return NextResponse.json({ bank, cash, accountData });
    } catch (error) {
        return NextResponse.json({ error: error || "Failed to fetch Accounts Data" }, { status: 500 });
    }
}

// PUT - Update all kinds of queries with reversal and payment method change handling
export async function PUT(request) {
    try {
        const body = await request.json();
        const companyId = await getCompanyId();
        
        // Validate that we have an ID to update
        if (!body.id) {
            return NextResponse.json(
                { error: 'ID is required for update' },
                { status: 400 }
            );
        }

        // Check if the loan account exists and belongs to the company
        const existingAccount = await prisma.loanAccount.findFirst({
            where: {
                id: body.id,
                companyId: companyId
            },
            include: {
                transactions: {
                    where: {
                        type: {
                            in: ['LOAN_DISBURSEMENT', 'LOAN_PROCESSING_FEE']
                        }
                    },
                    orderBy: {
                        date: 'desc'
                    }
                }
            }
        });

        if (!existingAccount) {
            return NextResponse.json(
                { error: 'Loan account not found or access denied' },
                { status: 404 }
            );
        }

        // Check if account number already exists for this company (excluding current account)
        if (body.accountNumber && body.accountNumber !== existingAccount.accountNumber) {
            const existing = await prisma.loanAccount.findFirst({
                where: {
                    accountNumber: body.accountNumber,
                    companyId: companyId,
                    NOT: {
                        id: body.id
                    }
                }
            });

            if (existing) {
                return NextResponse.json(
                    { error: 'Account number already exists for this company' },
                    { status: 409 }
                );
            }
        }

        // Prepare update data
        const updateData = {};
        const updatableFields = [
            'accountName',
            'lenderBank',
            'accountNumber',
            'description',
            'balanceAsOfDate',
            'interestRate',
            'termDurationMonths'
        ];

        updatableFields.forEach(field => {
            if (body[field] !== undefined) {
                if (field === 'balanceAsOfDate' && body[field]) {
                    updateData[field] = new Date(body[field]);
                } else if (field === 'interestRate') {
                    updateData[field] = body[field] ? parseFloat(body[field]) : null;
                } else if (field === 'termDurationMonths') {
                    updateData[field] = body[field] ? parseInt(body[field]) : null;
                } else {
                    updateData[field] = body[field];
                }
            }
        });

        // Handle payment method fields
        const getPaymentMethod = (paymentField) => {
            if (typeof paymentField === 'object' && paymentField?.accountdisplayname) {
                return {
                    name: paymentField.accountdisplayname,
                    id: paymentField.id || ""
                };
            }
            return {
                name: paymentField || "Cash",
                id: ""
            };
        };

        const newLoanReceived = getPaymentMethod(body.loanReceivedIn);
        const newProcessingFeePaidFrom = getPaymentMethod(body.processingFeePaidFrom);

        // Check if payment methods changed
        const loanReceivedMethodChanged = newLoanReceived.name !== existingAccount.loanReceivedIn;
        const processingFeeMethodChanged = newProcessingFeePaidFrom.name !== existingAccount.processingFeePaidFrom;

        // Determine if we need financial changes
        const currentBalanceChanged = body.currentBalance !== undefined && 
            parseFloat(body.currentBalance) !== existingAccount.currentBalance;
        
        const processingFeeChanged = body.processingFee !== undefined && 
            parseFloat(body.processingFee || 0) !== (existingAccount.processingFee || 0);

        const needsFinancialUpdate = currentBalanceChanged || processingFeeChanged || 
                                    loanReceivedMethodChanged || processingFeeMethodChanged;

        // If no financial changes, just update non-financial fields (no transaction needed)
        if (!needsFinancialUpdate) {
            const updatedAccount = await prisma.loanAccount.update({
                where: { id: body.id },
                data: updateData
            });
            
            return NextResponse.json(
                {
                    message: 'Loan account updated successfully',
                    data: updatedAccount,
                    status: true
                },
                { status: 200 }
            );
        }

        // For financial updates, use transaction with increased timeout
        const result = await prisma.$transaction(async (prisma) => {
            // Get cash adjustment once
            const cashAdjustment = await prisma.cashAdjustment.findFirst({
                where: { companyId: companyId }
            });

            // FIRST: Reverse the financial impact of existing transactions
            if (existingAccount.transactions.length > 0) {
                // Process each transaction to reverse its effect
                for (const transaction of existingAccount.transactions) {
                    const amount = Math.abs(transaction.amount || 0);
                    
                    if (transaction.paymentType === 'CASH') {
                        // Handle cash reversal
                        if (cashAdjustment) {
                            if (transaction.type === 'LOAN_PROCESSING_FEE') {
                                // Processing fee was deducted from cash, so add back
                                await prisma.cashAdjustment.update({
                                    where: { id: cashAdjustment.id },
                                    data: {
                                        cashInHand: {
                                            increment: amount
                                        }
                                    }
                                });
                            } else if (transaction.type === 'LOAN_DISBURSEMENT') {
                                // Loan disbursement was added to cash, so deduct
                                await prisma.cashAdjustment.update({
                                    where: { id: cashAdjustment.id },
                                    data: {
                                        cashInHand: {
                                            decrement: amount
                                        }
                                    }
                                });
                            }
                        }
                    } else {
                        // Handle bank reversal
                        const bankAccount = await prisma.cashAndBank.findFirst({
                            where: {
                                accountdisplayname: transaction.paymentType,
                                companyId: companyId
                            }
                        });
                        
                        if (bankAccount) {
                            if (transaction.type === 'LOAN_PROCESSING_FEE') {
                                // Processing fee was deducted from bank, so add back
                                await prisma.cashAndBank.update({
                                    where: { id: bankAccount.id },
                                    data: {
                                        openingbalance: {
                                            increment: amount
                                        }
                                    }
                                });
                            } else if (transaction.type === 'LOAN_DISBURSEMENT') {
                                // Loan disbursement was added to bank, so deduct
                                await prisma.cashAndBank.update({
                                    where: { id: bankAccount.id },
                                    data: {
                                        openingbalance: {
                                            decrement: amount
                                        }
                                    }
                                });
                            }
                        }
                    }
                }
            }

            // Update financial fields in the loan account
            if (body.currentBalance !== undefined) {
                updateData.currentBalance = parseFloat(body.currentBalance);
            } else {
                updateData.currentBalance = existingAccount.currentBalance;
                body.currentBalance = existingAccount.currentBalance;
            }
            
            if (body.processingFee !== undefined) {
                updateData.processingFee = body.processingFee ? parseFloat(body.processingFee) : null;
            } else {
                updateData.processingFee = existingAccount.processingFee;
                body.processingFee = existingAccount.processingFee;
            }

            // Update payment method fields
            updateData.loanReceivedIn = newLoanReceived.name;
            updateData.loanReceivedId = newLoanReceived.id || body.loanReceivedId || "";
            updateData.processingFeePaidFrom = newProcessingFeePaidFrom.name;
            updateData.processingFeePaidFromId = newProcessingFeePaidFrom.id || body.processingFeePaidFromId || "";

            // Update the loan account
            const updatedAccount = await prisma.loanAccount.update({
                where: { id: body.id },
                data: updateData
            });

            // NOW: Apply the new financial impact by UPDATING existing transactions
            if (existingAccount.transactions.length > 0) {
                // Separate transactions by type
                const processingFeeTransaction = existingAccount.transactions.find(t => t.type === 'LOAN_PROCESSING_FEE');
                const disbursementTransaction = existingAccount.transactions.find(t => t.type === 'LOAN_DISBURSEMENT');

                // Update processing fee transaction if it exists and processing fee changed
                if (processingFeeTransaction && body.processingFee > 0) {
                    const oldAmount = Math.abs(processingFeeTransaction.amount || 0);
                    const newAmount = parseFloat(body.processingFee);
                    
                    // Update the transaction
                    await prisma.transaction.update({
                        where: { id: processingFeeTransaction.id },
                        data: {
                            amount: -newAmount,
                            paymentType: newProcessingFeePaidFrom.name === "Cash" ? 'CASH' : newProcessingFeePaidFrom.name,
                            description: body.description || `Updated loan processing fee for ${body.accountName}`,
                            date: new Date()
                        }
                    });

                    // Apply the new financial impact
                    if (newProcessingFeePaidFrom.name === "Cash") {
                        if (cashAdjustment) {
                            await prisma.cashAdjustment.update({
                                where: { id: cashAdjustment.id },
                                data: {
                                    cashInHand: {
                                        decrement: newAmount
                                    }
                                }
                            });
                        }
                    } else {
                        const bankAccountId = newProcessingFeePaidFrom.id || body.processingFeePaidFromId;
                        if (bankAccountId) {
                            await prisma.cashAndBank.update({
                                where: { id: bankAccountId },
                                data: {
                                    openingbalance: {
                                        decrement: newAmount
                                    }
                                }
                            });
                        }
                    }
                } else if (!processingFeeTransaction && body.processingFee > 0) {
                    // Create new processing fee transaction if it didn't exist before
                    const amount = parseFloat(body.processingFee);
                    if (newProcessingFeePaidFrom.name === "Cash") {
                        if (cashAdjustment) {
                            await prisma.cashAdjustment.update({
                                where: { id: cashAdjustment.id },
                                data: {
                                    cashInHand: {
                                        decrement: amount
                                    }
                                }
                            });
                        }

                        await prisma.transaction.create({
                            data: {
                                amount: -amount,
                                paymentType: 'CASH',
                                description: body.description || `Updated loan processing fee for ${body.accountName}`,
                                type: 'LOAN_PROCESSING_FEE',
                                date: new Date(),
                                companyId: companyId,
                                loanAccountId: body.id
                            }
                        });
                    } else {
                        const bankAccountId = newProcessingFeePaidFrom.id || body.processingFeePaidFromId;
                        if (bankAccountId) {
                            await prisma.cashAndBank.update({
                                where: { id: bankAccountId },
                                data: {
                                    openingbalance: {
                                        decrement: amount
                                    }
                                }
                            });

                            await prisma.transaction.create({
                                data: {
                                    amount: -amount,
                                    paymentType: newProcessingFeePaidFrom.name,
                                    description: body.description || `Updated loan processing fee for ${body.accountName}`,
                                    type: 'LOAN_PROCESSING_FEE',
                                    date: new Date(),
                                    companyId: companyId,
                                    loanAccountId: body.id
                                }
                            });
                        }
                    }
                }

                // Update disbursement transaction if it exists and current balance changed
                if (disbursementTransaction && body.currentBalance > 0) {
                    const oldAmount = Math.abs(disbursementTransaction.amount || 0);
                    const newAmount = parseFloat(body.currentBalance);
                    
                    // Update the transaction
                    await prisma.transaction.update({
                        where: { id: disbursementTransaction.id },
                        data: {
                            amount: newAmount,
                            paymentType: newLoanReceived.name === "Cash" ? 'CASH' : newLoanReceived.name,
                            description: body.description || `Updated loan disbursement for ${body.accountName}`,
                            date: new Date()
                        }
                    });

                    // Apply the new financial impact
                    if (newLoanReceived.name === "Cash") {
                        if (cashAdjustment) {
                            await prisma.cashAdjustment.update({
                                where: { id: cashAdjustment.id },
                                data: {
                                    cashInHand: {
                                        increment: newAmount
                                    }
                                }
                            });
                        }
                    } else {
                        const bankAccountId = newLoanReceived.id || body.loanReceivedId;
                        if (bankAccountId) {
                            await prisma.cashAndBank.update({
                                where: { id: bankAccountId },
                                data: {
                                    openingbalance: {
                                        increment: newAmount
                                    }
                                }
                            });
                        }
                    }
                } else if (!disbursementTransaction && body.currentBalance > 0) {
                    // Create new disbursement transaction if it didn't exist before
                    const amount = parseFloat(body.currentBalance);
                    if (newLoanReceived.name === "Cash") {
                        if (cashAdjustment) {
                            await prisma.cashAdjustment.update({
                                where: { id: cashAdjustment.id },
                                data: {
                                    cashInHand: {
                                        increment: amount
                                    }
                                }
                            });
                        }

                        await prisma.transaction.create({
                            data: {
                                amount: amount,
                                paymentType: 'CASH',
                                description: body.description || `Updated loan disbursement for ${body.accountName}`,
                                type: 'LOAN_DISBURSEMENT',
                                date: new Date(),
                                companyId: companyId,
                                loanAccountId: body.id
                            }
                        });
                    } else {
                        const bankAccountId = newLoanReceived.id || body.loanReceivedId;
                        if (bankAccountId) {
                            await prisma.cashAndBank.update({
                                where: { id: bankAccountId },
                                data: {
                                    openingbalance: {
                                        increment: amount
                                    }
                                }
                            });

                            await prisma.transaction.create({
                                data: {
                                    amount: amount,
                                    paymentType: newLoanReceived.name,
                                    description: body.description || `Updated loan disbursement for ${body.accountName}`,
                                    type: 'LOAN_DISBURSEMENT',
                                    date: new Date(),
                                    companyId: companyId,
                                    loanAccountId: body.id
                                }
                            });
                        }
                    }
                }
            }

            return updatedAccount;
        }, {
            timeout: 30000,
            maxWait: 30000,
            isolationLevel: 'ReadCommitted'
        });

        return NextResponse.json(
            {
                message: 'Loan account updated successfully',
                data: result,
                status: true
            },
            { status: 200 }
        );

    } catch (error) {
        console.error('Error updating loan account:', error);
        
        if (error.code === 'P2028') {
            return NextResponse.json(
                { error: 'Transaction timeout. Please try again with fewer changes.' },
                { status: 408 }
            );
        }
        
        if (error.code === 'P2025') {
            return NextResponse.json(
                { error: 'Loan account not found' },
                { status: 404 }
            );
        }
        
        return NextResponse.json(
            { error: 'Failed to update loan account: ' + error.message },
            { status: 500 }
        );
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
            // Get cash adjustment once
            const cashAdjustment = await prisma.cashAdjustment.findFirst({
                where: { companyId: companyId }
            });

            // Separate cash and bank transactions
            const cashTransactions = existingLoanAccount.transactions.filter(t => t.paymentType === 'CASH');
            const bankTransactions = existingLoanAccount.transactions.filter(t => t.paymentType !== 'CASH');

            // Process cash reversals in batch
            if (cashTransactions.length > 0 && cashAdjustment) {
                const totalCashAmount = cashTransactions.reduce((sum, t) => {
                    const isProcessingFee = t.type === 'LOAN_PROCESSING_FEE';
                    return sum + (isProcessingFee ? Math.abs(t.amount) : -Math.abs(t.amount));
                }, 0);

                await prisma.cashAdjustment.update({
                    where: { id: cashAdjustment.id },
                    data: {
                        cashInHand: {
                            decrement: totalCashAmount
                        }
                    }
                });
            }

            // Process bank reversals
            for (const transaction of bankTransactions) {
                const isProcessingFee = transaction.type === 'LOAN_PROCESSING_FEE';
                const amount = Math.abs(transaction.amount || 0);
                
                const bankAccount = await prisma.cashAndBank.findFirst({
                    where: {
                        accountdisplayname: transaction.paymentType,
                        companyId: companyId
                    }
                });
                
                if (bankAccount) {
                    await prisma.cashAndBank.update({
                        where: { id: bankAccount.id },
                        data: {
                            openingbalance: {
                                [isProcessingFee ? "increment" : "decrement"]: amount,
                            }
                        }
                    });
                }
            }

            // Create reversal transactions in batch
            const reversalTransactions = existingLoanAccount.transactions.map(t => ({
                amount: -(t.amount || 0),
                paymentType: t.paymentType,
                description: `Reversal: ${t.description || 'Loan account deletion'}`,
                type: 'REVERSAL',
                date: new Date(),
                companyId: companyId,
                loanAccountId: id
            }));

            await prisma.transaction.createMany({
                data: reversalTransactions
            });

            // Delete all related transactions
            await prisma.transaction.deleteMany({
                where: {
                    loanAccountId: id
                }
            });

            // Delete the loan account
            const deletedAccount = await prisma.loanAccount.delete({
                where: {
                    id: id
                }
            });

            return deletedAccount;
        }, {
            timeout: 30000,
            maxWait: 30000,
            isolationLevel: 'ReadCommitted'
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
        
        if (error.code === 'P2028') {
            return NextResponse.json(
                { error: 'Transaction timeout. Please try again.' },
                { status: 408 }
            );
        }
        
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