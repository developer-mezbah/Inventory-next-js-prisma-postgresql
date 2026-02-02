import prisma from "@/lib/prisma";
import { getCompanyId } from "@/utils/GetCompanyId";
import { NextResponse } from "next/server";

export async function DELETE(request) {
  try {
    const companyId = await getCompanyId();
    const { searchParams } = new URL(request.url);
    const expenseId = searchParams.get('id');

    if (!expenseId) {
      return NextResponse.json(
        { error: "Expense ID is required" },
        { status: 400 }
      );
    }

    // First, fetch the expense with all related data to handle rollbacks
    const existingExpense = await prisma.Expense.findUnique({
      where: {
        id: expenseId,
        companyId: companyId,
      },
      include: {
        items: true,
        transaction: true,
        invoiceData: true,
        category: true,
      },
    });

    if (!existingExpense) {
      return NextResponse.json(
        { error: "Expense not found" },
        { status: 404 }
      );
    }

    // Roll back cash/bank adjustments
    await handleRollbackAdjustments(existingExpense, companyId);

    // Delete related records in the correct order
    
    // 1. Delete invoice data (references expense)
    await prisma.InvoiceData.deleteMany({
      where: {
        expenseId: expenseId,
      },
    });

    // 2. Update transactions to remove expense connections
    if (existingExpense.transaction && existingExpense.transaction.length > 0) {
      for (const transaction of existingExpense.transaction) {
        await prisma.Transaction.update({
          where: {
            id: transaction.id,
            companyId: companyId,
          },
          data: {
            expenseId: null,
            expenseItemId: null,
          },
        });
      }
    }

    // 3. Disconnect expense items from the expense (but don't delete them)
    if (existingExpense.items && existingExpense.items.length > 0) {
      await prisma.ExpenseItem.updateMany({
        where: {
          expenseId: expenseId,
          companyId: companyId,
        },
        data: {
          expenseId: null,
        },
      });
    }

    // 4. Delete transactions that were created for this expense
    if (existingExpense.transaction && existingExpense.transaction.length > 0) {
      await prisma.Transaction.deleteMany({
        where: {
          id: {
            in: existingExpense.transaction.map(t => t.id)
          },
          companyId: companyId,
        },
      });
    }

    // 5. Finally delete the expense
    await prisma.Expense.delete({
      where: {
        id: expenseId,
        companyId: companyId,
      },
    });

    return NextResponse.json(
      { 
        message: "Expense deleted successfully",
        data: {
          id: expenseId,
          billNumber: existingExpense.billNumber,
          total: existingExpense.price,
          preservedItemsCount: existingExpense.items?.length || 0,
        },
        status: true 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error deleting expense:", error);

    // Handle Prisma errors
    if (error.code) {
      if (error.code === "P2025") {
        return NextResponse.json(
          { message: "Expense not found or already deleted." },
          { status: 404 }
        );
      } else if (error.code === "P2003") {
        return NextResponse.json(
          { 
            message: "Cannot delete expense due to existing references.",
            details: "Please check related records."
          },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      {
        message: "Failed to delete expense",
        error: error.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}

async function handleRollbackAdjustments(expense, companyId) {
  try {
    // Roll back cash/bank adjustments made during expense creation
    if (expense.paymentType === "Cash") {
      // For cash payments, add back the deducted amount
      const cashAdjustment = await prisma.CashAdjustment.findFirst({
        where: {
          companyId: companyId,
          transaction: {
            some: {
              expenseId: expense.id
            }
          }
        }
      });

      if (cashAdjustment) {
        await prisma.CashAdjustment.update({
          where: {
            id: cashAdjustment.id,
            companyId: companyId,
          },
          data: {
            cashInHand: {
              increment: expense.price || 0
            },
          },
        });
      }
    } else {
      // For bank payments, add back the deducted amount
      const cashAndBank = await prisma.CashAndBank.findFirst({
        where: {
          id: expense.paymentTypeId,
          companyId: companyId,
        }
      });

      if (cashAndBank) {
        await prisma.CashAndBank.update({
          where: {
            id: expense.paymentTypeId,
            companyId: companyId,
          },
          data: {
            openingbalance: {
              increment: expense.price || 0
            },
          },
        });
      }
    }
  } catch (error) {
    console.error("Error rolling back adjustments:", error);
    // Don't throw here, let the main deletion continue
  }
}