import prisma from "@/lib/prisma";
import { getCompanyId } from "@/utils/GetCompanyId";
import { NextResponse } from "next/server";

export async function PUT(request) {
  let transaction;
  try {
    const body = await request.json();
    const companyId = await getCompanyId();

    // Validate required fields
    const requiredFields = ['accountId', 'totalAmount'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        );
      }
    }

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

    // Verify payment amount
    if (parseFloat(body.totalAmount) <= 0) {
      return NextResponse.json(
        { error: 'Payment amount must be greater than 0' },
        { status: 400 }
      );
    }

    // Calculate new balance
    const paymentAmount = parseFloat(body.principalAmount);
    const newBalance = loanAccount.currentBalance - paymentAmount;

    if (newBalance < 0) {
      return NextResponse.json(
        { error: 'Payment amount exceeds current loan balance' },
        { status: 400 }
      );
    }

    // Process payment based on payment type
    let cashBankRecord = null;
    let transactionData = null;

    if (body.paymentType === 'Cash') {
      // For cash payments - update CashAdjustment
      cashBankRecord = await prisma.cashAdjustment.upsert({
       where: {
            userId: body.userId,  // userId is @unique in your schema
        },
        update: {
          cashInHand: {
            increment: parseFloat(body.totalAmount)
          }
        },
        create: {
          userId: body.userId || 'default-user',
          companyId: companyId,
          cashInHand: parseFloat(body.totalAmount)
        }
      });
    } else {
      // For bank payments - find the bank account
      const bankAccount = await prisma.cashAndBank.findFirst({
        where: {
          accountdisplayname: body.paymentType,
          companyId: companyId
        }
      });

      if (!bankAccount) {
        return NextResponse.json(
          { error: `Bank account "${body.paymentType}" not found` },
          { status: 404 }
        );
      }

      // Update bank account
      cashBankRecord = await prisma.cashAndBank.update({
        where: {
          id: bankAccount.id
        },
        data: {
          openingbalance: {
            increment: parseFloat(body.totalAmount)
          }
        }
      });
    }

    // Now update loan account and create transaction in a single transaction
    transaction = await prisma.$transaction(async (prisma) => {
      // 1. Update loan account balance
      const updatedLoanAccount = await prisma.loanAccount.update({
        where: { id: body.accountId },
        data: { currentBalance: newBalance }
      });

      // 2. Create transaction record
      const newTransaction = await prisma.transaction.create({
        data: {
          amount: parseFloat(body.totalAmount),
          paymentType: body.paymentType,
          description: `Loan payment for ${loanAccount.accountName} - Principal: ${body.principalAmount}, Interest: ${body.interestAmount || 0}`,
          type: 'LOAN_PAYMENT',
          date: new Date(body.date),
          companyId: companyId,
          loanAccountId: body.accountId,
          name: loanAccount.accountName,
          status: 'COMPLETED',
          // Link to cash/bank adjustment
          ...(body.paymentType === 'Cash' 
            ? { cashAdjustmentId: cashBankRecord.id }
            : { cashAndBankId: cashBankRecord.id })
        }
      });

      return { updatedLoanAccount, transaction: newTransaction };
    }, {
      timeout: 10000, // Increase timeout to 10 seconds
      maxWait: 5000   // Maximum wait time for the transaction
    });

    return NextResponse.json({
      message: "Payment processed successfully",
      data: {
        newBalance: transaction.updatedLoanAccount.currentBalance,
        transactionId: transaction.transaction.id,
        accountDetails: {
          accountName: loanAccount.accountName,
          previousBalance: loanAccount.currentBalance,
          paymentAmount: body.totalAmount
        }
      }
    });

  } catch (error) {
    console.error('Error processing payment:', error);
    
    // More specific error handling
    if (error.code === 'P2028') {
      return NextResponse.json(
        { error: 'Transaction timeout. Please try again with a smaller amount or contact support.' },
        { status: 408 }
      );
    }
    
    if (error.code === 'P2034') {
      return NextResponse.json(
        { error: 'Transaction conflict. Please try again.' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Failed to process payment" },
      { status: 500 }
    );
  }
}