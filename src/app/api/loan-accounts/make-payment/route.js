import prisma from "@/lib/prisma";
import { getCompanyId } from "@/utils/GetCompanyId";
import { NextResponse } from "next/server";

function convertDMYToISO(dateString) {
  if (!dateString) return undefined;
  
  // Check if it's in DD/MM/YYYY format
  if (typeof dateString === 'string' && dateString.includes('/')) {
    const [day, month, year] = dateString.split('/');
    // Create date at UTC midnight to avoid timezone issues
    return new Date(Date.UTC(year, month - 1, day)).toISOString();
  }
  
  // If it's already in another format, try parsing directly
  try {
    return new Date(dateString).toISOString();
  } catch {
    return undefined;
  }
}

// Helper function to extract payment type details
const extractPaymentType = (paymentType) => {
  if (typeof paymentType === 'object' && paymentType !== null) {
    return {
      id: paymentType.id,
      name: paymentType.accountdisplayname || paymentType.name || 'Bank',
      type: 'BANK'
    };
  }
  return {
    id: null,
    name: paymentType === 'Cash' ? 'CASH' : paymentType || 'CASH',
    type: paymentType === 'Cash' ? 'CASH' : 'BANK'
  };
};

// Helper function to reverse cash/bank effect
const reverseCashBankEffect = async (prisma, oldPayment, companyId) => {
  const oldAmount = Math.abs(oldPayment.amount);
  const oldPaymentType = oldPayment.paymentType;
  
  if (oldPaymentType === 'CASH') {
    const cashAdjustment = await prisma.cashAdjustment.findFirst({
      where: { companyId: companyId }
    });
    
    if (cashAdjustment) {
      await prisma.cashAdjustment.update({
        where: { id: cashAdjustment.id },
        data: {
          cashInHand: {
            decrement: oldAmount
          }
        }
      });
    }
  } else {
    const bankAccount = await prisma.cashAndBank.findFirst({
      where: {
        accountdisplayname: oldPaymentType,
        companyId: companyId
      }
    });
    
    if (bankAccount) {
      await prisma.cashAndBank.update({
        where: { id: bankAccount.id },
        data: {
          openingbalance: {
            decrement: oldAmount
          }
        }
      });
    }
  }
};

export async function PUT(request) {
  try {
    const body = await request.json();
    console.log('Received payment request:', body);
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

    // Extract payment type details
    const paymentTypeDetails = extractPaymentType(body.paymentType);
    
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

    // Check if this is an update or create operation
    const isUpdate = body.mode === 'update' && body.paymentId;
    
    // Get existing payment if updating
    let existingPayment = null;
    if (isUpdate) {
      existingPayment = await prisma.transaction.findFirst({
        where: {
          id: body.paymentId,
          companyId: companyId,
          type: 'LOAN_PAYMENT'
        }
      });
      
      if (!existingPayment) {
        return NextResponse.json(
          { error: 'Payment record not found' },
          { status: 404 }
        );
      }
    }

    // Start a transaction for the payment processing
    const result = await prisma.$transaction(async (prisma) => {
      let finalLoanBalance = loanAccount.currentBalance;

      // If updating, reverse the previous payment effect
      if (isUpdate && existingPayment) {
        const oldPaymentAmount = Math.abs(existingPayment.amount);
        const oldPaymentType = existingPayment.paymentType;
        
        // Reverse the old payment's effect on loan balance
        finalLoanBalance = loanAccount.currentBalance + oldPaymentAmount;
        
        // Reverse the old payment's effect on cash/bank
        await reverseCashBankEffect(prisma, existingPayment, companyId);
      }

      // Calculate new balance after new payment
      const paymentAmount = parseFloat(body.principalAmount);
      const newBalance = finalLoanBalance - paymentAmount;

      if (newBalance < 0) {
        throw new Error('Payment amount exceeds current loan balance');
      }

      // Process new payment based on payment type
      let cashBankRecord = null;
      
      if (paymentTypeDetails.type === 'CASH') {
        // For cash payments - update CashAdjustment
        cashBankRecord = await prisma.cashAdjustment.upsert({
          where: {
            userId: body.userId || 'default-user',
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
        // For bank payments - find or use the bank account
        const bankAccountId = paymentTypeDetails.id || body.paymentType?.id;
        
        if (!bankAccountId) {
          throw new Error('Bank account ID is required for bank payments');
        }

        const bankAccount = await prisma.cashAndBank.findFirst({
          where: {
            id: bankAccountId,
            companyId: companyId
          }
        });

        if (!bankAccount) {
          throw new Error(`Bank account not found`);
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

      // Update loan account balance
      const updatedLoanAccount = await prisma.loanAccount.update({
        where: { id: body.accountId },
        data: { currentBalance: newBalance }
      });

      // Handle transaction record (update existing or create new)
      let transactionRecord;
      
      if (isUpdate && existingPayment) {
        // Update existing transaction
        transactionRecord = await prisma.transaction.update({
          where: { id: body.paymentId },
          data: {
            amount: parseFloat(body.totalAmount),
            paymentType: paymentTypeDetails.type === 'CASH' ? 'CASH' : paymentTypeDetails.name,
            cashAndBankId: paymentTypeDetails.type === 'CASH' ? null : (paymentTypeDetails.id || body.paymentType?.id),
            description: `Loan payment for ${loanAccount.accountName} - Principal: ${body.principalAmount}, Interest: ${body.interestAmount || 0}`,
            date: convertDMYToISO(body.date) || new Date(),
            status: 'COMPLETED',
            ...(paymentTypeDetails.type === 'CASH' 
              ? { cashAdjustmentId: cashBankRecord.id, cashAndBankId: null }
              : { cashAndBankId: cashBankRecord.id, cashAdjustmentId: null })
          }
        });
      } else {
        // Create new transaction
        transactionRecord = await prisma.transaction.create({
          data: {
            amount: parseFloat(body.totalAmount),
            paymentType: paymentTypeDetails.type === 'CASH' ? 'CASH' : paymentTypeDetails.name,
            cashAndBankId: paymentTypeDetails.type === 'CASH' ? null : (paymentTypeDetails.id || body.paymentType?.id),
            description: `Loan payment for ${loanAccount.accountName} - Principal: ${body.principalAmount}, Interest: ${body.interestAmount || 0}`,
            type: 'LOAN_PAYMENT',
            date: convertDMYToISO(body.date) || new Date(),
            companyId: companyId,
            loanAccountId: body.accountId,
            name: loanAccount.accountName,
            status: 'COMPLETED',
            ...(paymentTypeDetails.type === 'CASH' 
              ? { cashAdjustmentId: cashBankRecord.id }
              : { cashAndBankId: cashBankRecord.id })
          }
        });
      }

      return { 
        updatedLoanAccount, 
        transaction: transactionRecord,
        isUpdate 
      };
    }, {
      timeout: 30000,
      maxWait: 15000,
      isolationLevel: 'ReadCommitted'
    });

    return NextResponse.json({
      message: result.isUpdate ? "Payment updated successfully" : "Payment processed successfully",
      data: {
        newBalance: result.updatedLoanAccount.currentBalance,
        transactionId: result.transaction.id,
        accountDetails: {
          accountName: loanAccount.accountName,
          previousBalance: loanAccount.currentBalance,
          paymentAmount: body.totalAmount,
          paymentType: paymentTypeDetails.name
        }
      }
    });

  } catch (error) {
    console.error('Error processing payment:', error);
    
    if (error.code === 'P2028') {
      return NextResponse.json(
        { error: 'Transaction timeout. Please try again.' },
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




// Helper function to reverse cash/bank effect
const reverseCashBankDeleteEffect = async (prisma, transaction, companyId) => {
  const amount = Math.abs(transaction.amount);
  const paymentType = transaction.paymentType;
  
  if (paymentType === 'CASH') {
    const cashAdjustment = await prisma.cashAdjustment.findFirst({
      where: { companyId: companyId }
    });
    
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
  } else {
    const bankAccount = await prisma.cashAndBank.findFirst({
      where: {
        accountdisplayname: paymentType,
        companyId: companyId
      }
    });
    
    if (bankAccount) {
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
};

// DELETE payment endpoint
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const paymentId = searchParams.get('paymentId');
    const accountId = searchParams.get('accountId');
    
  

    if (!paymentId || !accountId) {
      return NextResponse.json(
        { error: 'Payment ID and Account ID are required' },
        { status: 400 }
      );
    }

    const companyId = await getCompanyId();

    // Start a transaction for the deletion process
    const result = await prisma.$transaction(async (prisma) => {
      // 1. Find the payment transaction
      const paymentTransaction = await prisma.transaction.findFirst({
        where: {
          id: paymentId,
          loanAccountId: accountId,
          companyId: companyId,
          type: 'LOAN_PAYMENT'
        }
      });

      if (!paymentTransaction) {
        throw new Error('Payment transaction not found');
      }

      // 2. Find the loan account
      const loanAccount = await prisma.loanAccount.findFirst({
        where: {
          id: accountId,
          companyId: companyId
        }
      });

      if (!loanAccount) {
        throw new Error('Loan account not found');
      }

      // 3. Calculate the new balance (add back the payment amount)
      const paymentAmount = Math.abs(paymentTransaction.amount);
      const newBalance = loanAccount.currentBalance + paymentAmount;

      // 4. Reverse the cash/bank effect
      await reverseCashBankDeleteEffect(prisma, paymentTransaction, companyId);

      // 5. Update loan account balance
      const updatedLoanAccount = await prisma.loanAccount.update({
        where: { id: accountId },
        data: { currentBalance: newBalance }
      });

      // 6. Delete the payment transaction
      await prisma.transaction.delete({
        where: { id: paymentId }
      });

      return {
        loanAccount: updatedLoanAccount,
        paymentAmount,
        accountName: loanAccount.accountName,
        paymentType: paymentTransaction.paymentType
      };
    }, {
      timeout: 30000,
      maxWait: 15000,
      isolationLevel: 'ReadCommitted'
    });

    return NextResponse.json({
      message: "Payment deleted successfully",
      status: true,
      data: {
        newBalance: result.loanAccount.currentBalance,
        deletedPaymentAmount: result.paymentAmount,
        accountDetails: {
          accountName: result.accountName,
          paymentType: result.paymentType,
          currentBalance: result.loanAccount.currentBalance
        }
      }
    });

  } catch (error) {
    console.error('Error deleting payment:', error);
    
    if (error.message === 'Payment transaction not found') {
      return NextResponse.json(
        { error: 'Payment transaction not found' },
        { status: 404 }
      );
    }
    
    if (error.message === 'Loan account not found') {
      return NextResponse.json(
        { error: 'Loan account not found' },
        { status: 404 }
      );
    }
    
    if (error.code === 'P2028') {
      return NextResponse.json(
        { error: 'Transaction timeout. Please try again.' },
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
      { error: error.message || "Failed to delete payment" },
      { status: 500 }
    );
  }
}

