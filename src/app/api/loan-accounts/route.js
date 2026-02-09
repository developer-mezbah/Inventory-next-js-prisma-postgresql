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
        });


        return NextResponse.json({ bank, cash, accountData });
    } catch (error) {
        return NextResponse.json({ error: error || "Failed to fetch Accounts Data" }, { status: 500 });
    }
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

        const transaction = {
                create: {
                  amount: parseFloat(body.currentBalance),
                  paymentType: 'CASH',
                  description: body.description || `Initial loan disbursement for ${body.accountName}`,
                  type: 'LOAN_DISBURSEMENT',
                  date: new Date(),
                  companyId: companyId
                }
              }
        const res = await prisma.CashAdjustment.upsert({
            where: {
                userId: body?.userId,
                companyId: await getCompanyId(),
            },
            update: {
                cashInHand: {
                    increment: body?.paidAmount,
                },
            },
            create: {
                userId: body?.userId,
                companyId: await getCompanyId(),
                cashInHand:
                    { increment: body?.paidAmount, }
            },
        });


        // Create loan account with transaction if received in cash
        let loanAccount;

        if (body.loanReceivedInCash) {
          // Create with transaction in one operation
          loanAccount = await prisma.loanAccount.create({
            data: {
              accountName: body.accountName,
              lenderBank: body.lenderBank,
              accountNumber: body.accountNumber,
              description: body.description,
              balanceAsOfDate: body.balanceAsOfDate ? new Date(body.balanceAsOfDate) : null,
              currentBalance: parseFloat(body.currentBalance),
              loanReceivedInCash: body.loanReceivedInCash || false,
              interestRate: body.interestRate ? parseFloat(body.interestRate) : null,
              termDurationMonths: body.termDurationMonths ? parseInt(body.termDurationMonths) : null,
              processingFee: body.processingFee ? parseFloat(body.processingFee) : null,
              processingFeePaidFromCash: body.processingFeePaidFromCash || false,
              companyId: companyId,
              // Create initial disbursement transaction
              transactions: {
                create: {
                  amount: parseFloat(body.currentBalance),
                  paymentType: 'CASH',
                  description: body.description || `Initial loan disbursement for ${body.accountName}`,
                  type: 'LOAN_DISBURSEMENT',
                  date: new Date(),
                  companyId: companyId
                }
              }
            },
            include: { transactions: true }
          });
        } else {
          // Create without initial transaction
          loanAccount = await prisma.loanAccount.create({
            data: {
              accountName: body.accountName,
              lenderBank: body.lenderBank,
              accountNumber: body.accountNumber,
              description: body.description,
              balanceAsOfDate: body.balanceAsOfDate ? new Date(body.balanceAsOfDate) : null,
              currentBalance: parseFloat(body.currentBalance),
              loanReceivedInCash: body.loanReceivedInCash || false,
              interestRate: body.interestRate ? parseFloat(body.interestRate) : null,
              termDurationMonths: body.termDurationMonths ? parseInt(body.termDurationMonths) : null,
              processingFee: body.processingFee ? parseFloat(body.processingFee) : null,
              processingFeePaidFromCash: body.processingFeePaidFromCash || false,
              companyId: companyId
            }
          });
        }

        return NextResponse.json(
            {
                message: 'Loan account created successfully',
                data: "loanAccount"
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