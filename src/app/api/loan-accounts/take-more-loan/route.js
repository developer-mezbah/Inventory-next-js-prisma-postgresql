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

// Helper function to reverse cash/bank effect for loan increase
const reverseLoanIncreaseEffect = async (prisma, transaction, companyId) => {
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
            decrement: amount // Remove the cash that was added
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
            decrement: amount // Remove the amount that was added to bank
          }
        }
      });
    } else if (transaction.cashAndBankId) {
      await prisma.cashAndBank.update({
        where: { id: transaction.cashAndBankId },
        data: {
          openingbalance: {
            decrement: amount
          }
        }
      });
    }
  }
};

// PUT - Create or Update Take More Loan
export async function PUT(request) {
  try {
    const body = await request.json();
    console.log('Received take more loan request:', body);
    const companyId = await getCompanyId();

    // Validate required fields
    const requiredFields = ['accountId', 'amount'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        );
      }
    }

    // Validate amount
    if (parseFloat(body.amount) <= 0) {
      return NextResponse.json(
        { error: 'Loan amount must be greater than 0' },
        { status: 400 }
      );
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

    // Check if this is an update or create operation
    const isUpdate = body.mode === 'update' && body.takeLoanId;
    
    // Get existing loan increase transaction if updating
    let existingTransaction = null;
    if (isUpdate) {
      existingTransaction = await prisma.transaction.findFirst({
        where: {
          id: body.takeLoanId,
          loanAccountId: body.accountId,
          companyId: companyId,
          type: 'LOAN_INCREASE' // You'll need to add this type to your schema
        }
      });
      
      if (!existingTransaction) {
        return NextResponse.json(
          { error: 'Loan increase record not found' },
          { status: 404 }
        );
      }
    }

    // Start a transaction
    const result = await prisma.$transaction(async (prisma) => {
      let finalLoanBalance = loanAccount.currentBalance;

      // If updating, reverse the previous loan increase effect
      if (isUpdate && existingTransaction) {
        const oldAmount = Math.abs(existingTransaction.amount);
        
        // Reverse the old loan increase effect on loan balance
        finalLoanBalance = loanAccount.currentBalance - oldAmount;
        
        // Reverse the old loan increase effect on cash/bank
        await reverseLoanIncreaseEffect(prisma, existingTransaction, companyId);
      }

      // Calculate new balance after new loan increase
      const increaseAmount = parseFloat(body.amount);
      const newBalance = finalLoanBalance + increaseAmount;

      // Process new loan increase based on payment type
      let cashBankRecord = null;
      
      if (paymentTypeDetails.type === 'CASH') {
        // For cash - update CashAdjustment (increase cash)
        cashBankRecord = await prisma.cashAdjustment.upsert({
          where: {
            userId: body.userId || 'default-user',
          },
          update: {
            cashInHand: {
              increment: increaseAmount
            }
          },
          create: {
            userId: body.userId || 'default-user',
            companyId: companyId,
            cashInHand: increaseAmount
          }
        });
      } else {
        // For bank payments - find the bank account
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

        // Update bank account (increase balance)
        cashBankRecord = await prisma.cashAndBank.update({
          where: {
            id: bankAccount.id
          },
          data: {
            openingbalance: {
              increment: increaseAmount
            }
          }
        });
      }

      // Update loan account balance (increase it)
      const updatedLoanAccount = await prisma.loanAccount.update({
        where: { id: body.accountId },
        data: { currentBalance: newBalance }
      });

      // Handle transaction record (update existing or create new)
      let transactionRecord;
      
      if (isUpdate && existingTransaction) {
        // Update existing transaction
        transactionRecord = await prisma.transaction.update({
          where: { id: body.takeLoanId },
          data: {
            amount: increaseAmount,
            paymentType: paymentTypeDetails.type === 'CASH' ? 'CASH' : paymentTypeDetails.name,
            cashAndBankId: paymentTypeDetails.type === 'CASH' ? null : (paymentTypeDetails.id || body.paymentType?.id),
            description: `Additional loan taken for ${loanAccount.accountName}`,
            date: convertDMYToISO(body.date) || new Date(),
            status: 'COMPLETED',
            type: 'LOAN_INCREASE',
            ...(paymentTypeDetails.type === 'CASH' 
              ? { cashAdjustmentId: cashBankRecord.id, cashAndBankId: null }
              : { cashAndBankId: cashBankRecord.id, cashAdjustmentId: null })
          }
        });
      } else {
        // Create new transaction
        transactionRecord = await prisma.transaction.create({
          data: {
            amount: increaseAmount,
            paymentType: paymentTypeDetails.type === 'CASH' ? 'CASH' : paymentTypeDetails.name,
            cashAndBankId: paymentTypeDetails.type === 'CASH' ? null : (paymentTypeDetails.id || body.paymentType?.id),
            description: `Additional loan taken for ${loanAccount.accountName}`,
            type: 'LOAN_INCREASE',
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
      message: result.isUpdate ? "Loan increase updated successfully" : "Loan increased successfully",
      status: true,
      data: {
        newBalance: result.updatedLoanAccount.currentBalance,
        transactionId: result.transaction.id,
        accountDetails: {
          accountName: loanAccount.accountName,
          previousBalance: loanAccount.currentBalance,
          increasedAmount: body.amount,
          paymentType: paymentTypeDetails.name,
          newBalance: result.updatedLoanAccount.currentBalance
        }
      }
    });

  } catch (error) {
    console.error('Error processing loan increase:', error);
    
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
      { error: error.message || "Failed to process loan increase" },
      { status: 500 }
    );
  }
}

// DELETE - Remove a loan increase transaction
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const takeLoanId = searchParams.get('takeLoanId');
    const accountId = searchParams.get('accountId');
    
    console.log('Delete loan increase request:', { takeLoanId, accountId });

    if (!takeLoanId || !accountId) {
      return NextResponse.json(
        { error: 'Take Loan ID and Account ID are required' },
        { status: 400 }
      );
    }

    const companyId = await getCompanyId();

    // Start a transaction for the deletion process
    const result = await prisma.$transaction(async (prisma) => {
      // 1. Find the loan increase transaction
      const loanTransaction = await prisma.transaction.findFirst({
        where: {
          id: takeLoanId,
          loanAccountId: accountId,
          companyId: companyId,
          type: 'LOAN_INCREASE'
        }
      });

      if (!loanTransaction) {
        throw new Error('Loan increase transaction not found');
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

      // 3. Calculate the new balance (subtract the loan increase amount)
      const increaseAmount = Math.abs(loanTransaction.amount);
      const newBalance = loanAccount.currentBalance - increaseAmount;

      if (newBalance < 0) {
        throw new Error('Cannot delete: This would make the loan balance negative');
      }

      // 4. Reverse the cash/bank effect (remove the money that was added)
      if (loanTransaction.paymentType === 'CASH') {
        const cashAdjustment = await prisma.cashAdjustment.findFirst({
          where: { companyId: companyId }
        });
        
        if (cashAdjustment) {
          await prisma.cashAdjustment.update({
            where: { id: cashAdjustment.id },
            data: {
              cashInHand: {
                decrement: increaseAmount
              }
            }
          });
        }
      } else {
        // Find bank account by name or ID
        const bankAccount = await prisma.cashAndBank.findFirst({
          where: {
            OR: [
              { accountdisplayname: loanTransaction.paymentType },
              { id: loanTransaction.cashAndBankId || '' }
            ],
            companyId: companyId
          }
        });
        
        if (bankAccount) {
          await prisma.cashAndBank.update({
            where: { id: bankAccount.id },
            data: {
              openingbalance: {
                decrement: increaseAmount
              }
            }
          });
        }
      }

      // 5. Update loan account balance (decrease it)
      const updatedLoanAccount = await prisma.loanAccount.update({
        where: { id: accountId },
        data: { currentBalance: newBalance }
      });

      // 6. Delete the loan increase transaction
      await prisma.transaction.delete({
        where: { id: takeLoanId }
      });

      return {
        loanAccount: updatedLoanAccount,
        increaseAmount,
        accountName: loanAccount.accountName,
        paymentType: loanTransaction.paymentType
      };
    }, {
      timeout: 30000,
      maxWait: 15000,
      isolationLevel: 'ReadCommitted'
    });

    return NextResponse.json({
      message: "Loan increase deleted successfully",
      status: true,
      data: {
        newBalance: result.loanAccount.currentBalance,
        deletedAmount: result.increaseAmount,
        accountDetails: {
          accountName: result.accountName,
          paymentType: result.paymentType,
          currentBalance: result.loanAccount.currentBalance
        }
      }
    });

  } catch (error) {
    console.error('Error deleting loan increase:', error);
    
    if (error.message === 'Loan increase transaction not found') {
      return NextResponse.json(
        { error: 'Loan increase transaction not found' },
        { status: 404 }
      );
    }
    
    if (error.message === 'Loan account not found') {
      return NextResponse.json(
        { error: 'Loan account not found' },
        { status: 404 }
      );
    }

    if (error.message === 'Cannot delete: This would make the loan balance negative') {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
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
      { error: error.message || "Failed to delete loan increase" },
      { status: 500 }
    );
  }
}

// GET - Fetch loan increase transactions
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get('accountId');
    const takeLoanId = searchParams.get('takeLoanId');
    
    const companyId = await getCompanyId();

    // If specific transaction ID is provided
    if (takeLoanId) {
      const transaction = await prisma.transaction.findFirst({
        where: {
          id: takeLoanId,
          companyId: companyId,
          type: 'LOAN_INCREASE'
        },
        include: {
          loanAccount: {
            select: {
              id: true,
              accountName: true,
              currentBalance: true
            }
          },
          cashAdjustment: true,
          cashAndBank: true
        }
      });

      if (!transaction) {
        return NextResponse.json(
          { error: 'Loan increase transaction not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        data: transaction
      });
    }

    // If account ID is provided, get all loan increases for that account
    if (accountId) {
      const transactions = await prisma.transaction.findMany({
        where: {
          loanAccountId: accountId,
          companyId: companyId,
          type: 'LOAN_INCREASE'
        },
        orderBy: {
          date: 'desc'
        },
        include: {
          cashAdjustment: true,
          cashAndBank: true
        }
      });

      // Get loan account details
      const loanAccount = await prisma.loanAccount.findFirst({
        where: {
          id: accountId,
          companyId: companyId
        },
        select: {
          id: true,
          accountName: true,
          currentBalance: true
        }
      });

      return NextResponse.json({
        data: {
          loanAccount,
          transactions
        }
      });
    }

    // If no filters, get all loan increase transactions
    const transactions = await prisma.transaction.findMany({
      where: {
        companyId: companyId,
        type: 'LOAN_INCREASE'
      },
      orderBy: {
        date: 'desc'
      },
      include: {
        loanAccount: {
          select: {
            id: true,
            accountName: true,
            currentBalance: true
          }
        }
      }
    });

    return NextResponse.json({
      data: transactions
    });

  } catch (error) {
    console.error('Error fetching loan increases:', error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch loan increases" },
      { status: 500 }
    );
  }
}