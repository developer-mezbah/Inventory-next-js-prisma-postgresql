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


const cashProcessing = async (body, companyId, processingFee = false) => {
    // Create transaction data function
    const createTransactionData = () => ({
        amount: processingFee ? -parseFloat(body.processingFee) : parseFloat(body.currentBalance),
        paymentType: 'CASH',
        description: body.description || `Initial loan disbursement for ${body.accountName}`,
        type: processingFee ? 'LOAN_PROCESSING_FEE' : 'LOAN_DISBURSEMENT',
        date: new Date(),
        companyId: companyId
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

const bankProcessing = async (body, companyId, processingFee = false) => {
    // Create transaction data function
    const createTransactionData = () => ({
        amount: processingFee ? -parseFloat(body.processingFee) : parseFloat(body.currentBalance),
        paymentType: processingFee ? body.processingFeePaidFrom?.accountdisplayname || "" : body.loanReceivedIn?.accountdisplayname || "",
        description: body.description || `Initial loan disbursement for ${body.accountName}`,
        type: processingFee ? 'LOAN_PROCESSING_FEE' : 'LOAN_DISBURSEMENT',
        date: new Date(),
        companyId: companyId
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
                    await cashProcessing(body, companyId, true);
                } else {
                    await bankProcessing(body, companyId, true);
                }
            }

            // Process loan disbursement after processing fee
            if (body?.currentBalance > 0) {
                if (body?.loanReceivedIn === "Cash" || body.loanReceivedIn?.accountdisplayname === "Cash") {
                    await cashProcessing(body, companyId, false);
                } else {
                    await bankProcessing(body, companyId, false);
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