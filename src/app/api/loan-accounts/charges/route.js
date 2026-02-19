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

// Helper function to reverse cash/bank effect for charges
const reverseChargeEffect = async (prisma, transaction, companyId) => {
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
            increment: amount // Add back the cash that was deducted
          }
        }
      });
    }
  } else {
    const bankAccount = await prisma.cashAndBank.findFirst({
      where: {
        OR: [
          { accountdisplayname: paymentType },
          { id: transaction.cashAndBankId || '' }
        ],
        companyId: companyId
      }
    });
    
    if (bankAccount) {
      await prisma.cashAndBank.update({
        where: { id: bankAccount.id },
        data: {
          openingbalance: {
            increment: amount // Add back the amount that was deducted
          }
        }
      });
    }
  }
};

// PUT - Create or Update Loan Charges
export async function PUT(request) {
  try {
    const body = await request.json();
    console.log('Received loan charge request:', body);
    const companyId = await getCompanyId();

    // Validate required fields
    const requiredFields = ['accountId', 'amount', 'chargeType'];
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
        { error: 'Charge amount must be greater than 0' },
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
    const isUpdate = body.mode === 'update' && body.chargesId;
    
    // Get existing charge transaction if updating
    let existingTransaction = null;
    if (isUpdate) {
      existingTransaction = await prisma.transaction.findFirst({
        where: {
          id: body.chargesId,
          loanAccountId: body.accountId,
          companyId: companyId,
          type: 'LOAN_CHARGE'
        }
      });
      
      if (!existingTransaction) {
        return NextResponse.json(
          { error: 'Loan charge record not found' },
          { status: 404 }
        );
      }
    }

    // Start a transaction
    const result = await prisma.$transaction(async (prisma) => {
      let finalLoanBalance = loanAccount.currentBalance;

      // If updating, reverse the previous charge effect and delete old transaction
      if (isUpdate && existingTransaction) {
        const oldAmount = Math.abs(existingTransaction.amount);
        
        // Reverse the old charge effect on loan balance (add back the old charge)
        finalLoanBalance = loanAccount.currentBalance + oldAmount;
        
        // Reverse the old charge effect on cash/bank (add back the money)
        await reverseChargeEffect(prisma, existingTransaction, companyId);
        
        // Delete the old transaction
        await prisma.transaction.delete({
          where: { id: body.chargesId }
        });
      }

      // Calculate new balance after new charge
      const chargeAmount = parseFloat(body.amount);
      const newBalance = finalLoanBalance + chargeAmount; // Charges INCREASE the loan balance

      // Process new charge based on payment type
      let cashBankRecord = null;
      
      if (paymentTypeDetails.type === 'CASH') {
        // For cash payments - DECREASE CashAdjustment (paying charge from cash)
        cashBankRecord = await prisma.cashAdjustment.upsert({
          where: {
            userId: body.userId || 'default-user',
          },
          update: {
            cashInHand: {
              decrement: chargeAmount // Cash decreases when paying charges
            }
          },
          create: {
            userId: body.userId || 'default-user',
            companyId: companyId,
            cashInHand: -chargeAmount // Negative for charges paid from cash
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

        // Update bank account (DECREASE balance when paying charges)
        cashBankRecord = await prisma.cashAndBank.update({
          where: {
            id: bankAccount.id
          },
          data: {
            openingbalance: {
              decrement: chargeAmount
            }
          }
        });
      }

      // Update loan account balance (INCREASE it by charge amount)
      const updatedLoanAccount = await prisma.loanAccount.update({
        where: { id: body.accountId },
        data: { currentBalance: newBalance }
      });

      // Create new transaction record (always create new, even for updates)
      const transactionRecord = await prisma.transaction.create({
        data: {
          amount: -chargeAmount, // Negative amount for charges
          paymentType: paymentTypeDetails.type === 'CASH' ? 'CASH' : paymentTypeDetails.name,
          cashAndBankId: paymentTypeDetails.type === 'CASH' ? null : (paymentTypeDetails.id || body.paymentType?.id),
          description: `${body.chargeType}`,
          type: 'LOAN_CHARGE',
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
      message: result.isUpdate ? "Loan charge updated successfully" : "Loan charge applied successfully",
      status: true,
      data: {
        newBalance: result.updatedLoanAccount.currentBalance,
        transactionId: result.transaction.id,
        chargeType: body.chargeType,
        accountDetails: {
          accountName: loanAccount.accountName,
          previousBalance: loanAccount.currentBalance,
          chargeAmount: body.amount,
          paymentType: paymentTypeDetails.name,
          newBalance: result.updatedLoanAccount.currentBalance
        }
      }
    });

  } catch (error) {
    console.error('Error processing loan charge:', error);
    
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
      { error: error.message || "Failed to process loan charge" },
      { status: 500 }
    );
  }
}

// DELETE - Remove a loan charge
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const chargeId = searchParams.get('chargeId');
    const accountId = searchParams.get('accountId');
    
    console.log('Delete loan charge request:', { chargeId, accountId });

    if (!chargeId || !accountId) {
      return NextResponse.json(
        { error: 'Charge ID and Account ID are required' },
        { status: 400 }
      );
    }

    const companyId = await getCompanyId();

    // Start a transaction for the deletion process
    const result = await prisma.$transaction(async (prisma) => {
      // 1. Find the charge transaction
      const chargeTransaction = await prisma.transaction.findFirst({
        where: {
          id: chargeId,
          loanAccountId: accountId,
          companyId: companyId,
          type: 'LOAN_CHARGE'
        }
      });

      if (!chargeTransaction) {
        throw new Error('Loan charge transaction not found');
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

      // 3. Calculate the new balance (subtract the charge amount)
      const chargeAmount = Math.abs(chargeTransaction.amount);
      const newBalance = loanAccount.currentBalance - chargeAmount;

      if (newBalance < 0) {
        throw new Error('Cannot delete: This would make the loan balance negative');
      }

      // 4. Reverse the cash/bank effect (add back the money that was taken)
      if (chargeTransaction.paymentType === 'CASH') {
        const cashAdjustment = await prisma.cashAdjustment.findFirst({
          where: { companyId: companyId }
        });
        
        if (cashAdjustment) {
          await prisma.cashAdjustment.update({
            where: { id: cashAdjustment.id },
            data: {
              cashInHand: {
                increment: chargeAmount // Add back the cash
              }
            }
          });
        }
      } else {
        // Find bank account by name or ID
        const bankAccount = await prisma.cashAndBank.findFirst({
          where: {
            OR: [
              { accountdisplayname: chargeTransaction.paymentType },
              { id: chargeTransaction.cashAndBankId || '' }
            ],
            companyId: companyId
          }
        });
        
        if (bankAccount) {
          await prisma.cashAndBank.update({
            where: { id: bankAccount.id },
            data: {
              openingbalance: {
                increment: chargeAmount // Add back the money
              }
            }
          });
        }
      }

      // 5. Update loan account balance (decrease it by removing the charge)
      const updatedLoanAccount = await prisma.loanAccount.update({
        where: { id: accountId },
        data: { currentBalance: newBalance }
      });

      // 6. Delete the charge transaction
      await prisma.transaction.delete({
        where: { id: chargeId }
      });

      return {
        loanAccount: updatedLoanAccount,
        chargeAmount,
        accountName: loanAccount.accountName,
        chargeType: chargeTransaction.metadata?.chargeType || 'Unknown',
        paymentType: chargeTransaction.paymentType
      };
    }, {
      timeout: 30000,
      maxWait: 15000,
      isolationLevel: 'ReadCommitted'
    });

    return NextResponse.json({
      message: "Loan charge deleted successfully",
      status: true,
      data: {
        newBalance: result.loanAccount.currentBalance,
        deletedAmount: result.chargeAmount,
        chargeType: result.chargeType,
        accountDetails: {
          accountName: result.accountName,
          paymentType: result.paymentType,
          currentBalance: result.loanAccount.currentBalance
        }
      }
    });

  } catch (error) {
    console.error('Error deleting loan charge:', error);
    
    if (error.message === 'Loan charge transaction not found') {
      return NextResponse.json(
        { error: 'Loan charge transaction not found' },
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
      { error: error.message || "Failed to delete loan charge" },
      { status: 500 }
    );
  }
}

// GET - Fetch loan charges
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get('accountId');
    const chargeId = searchParams.get('chargeId');
    const chargeType = searchParams.get('chargeType');
    
    const companyId = await getCompanyId();

    // If specific transaction ID is provided
    if (chargeId) {
      const transaction = await prisma.transaction.findFirst({
        where: {
          id: chargeId,
          companyId: companyId,
          type: 'LOAN_CHARGE'
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
          { error: 'Loan charge transaction not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        data: transaction
      });
    }

    // Build where clause
    const whereClause = {
      companyId: companyId,
      type: 'LOAN_CHARGE'
    };

    if (accountId) {
      whereClause.loanAccountId = accountId;
    }

    if (chargeType) {
      whereClause.metadata = {
        path: ['chargeType'],
        equals: chargeType
      };
    }

    // Get all charges with filters
    const transactions = await prisma.transaction.findMany({
      where: whereClause,
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
        },
        cashAdjustment: true,
        cashAndBank: true
      }
    });

    // If account ID is provided, also return loan account details
    if (accountId) {
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
          charges: transactions,
          totalCharges: transactions.reduce((sum, t) => sum + Math.abs(t.amount), 0)
        }
      });
    }

    return NextResponse.json({
      data: transactions,
      summary: {
        totalCharges: transactions.length,
        totalAmount: transactions.reduce((sum, t) => sum + Math.abs(t.amount), 0)
      }
    });

  } catch (error) {
    console.error('Error fetching loan charges:', error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch loan charges" },
      { status: 500 }
    );
  }
}