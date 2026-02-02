import prisma from "@/lib/prisma";
import { generateShortSecureID } from "@/utils/generateShortSecureID";
import { getCompanyId } from "@/utils/GetCompanyId";
import { NextResponse } from "next/server";

async function handleCategory(body) {
  // Only create new category if newCategory is provided
  if (body?.newCategory) {
    const newCategory = await prisma.ExpenseCategory.create({
      data: {
        name: body?.newCategory,
        expenseType: body?.selectedParty?.expenseType || null,
        companyId: await getCompanyId(),
      },
    });
    return newCategory?.id;
  }
  // Return the existing category ID from selectedParty
  return body?.selectedParty?.id;
}

async function handleCashAdjustment(body, oldTotal, newTotal) {
  const companyId = await getCompanyId();
  const difference = newTotal - oldTotal;

  if (body?.paymentType === "Cash") {
    const res = await prisma.CashAdjustment.upsert({
      where: {
        userId: body?.userId,
        companyId: companyId,
      },
      update: {
        cashInHand: {
          decrement: difference
        },
      },
      create: {
        userId: body?.userId,
        companyId: companyId,
        cashInHand: newTotal || 0
      },
    });

    return res?.id;
  } else {
    if (difference !== 0) {
      await prisma.CashAndBank.update({
        where: {
          id: body?.paymentType?.id,
          companyId: companyId,
        },
        data: {
          openingbalance: {
            decrement: difference,
          },
        },
      });
    }
    return body?.paymentType?.id;
  }
}

async function handleItems(body, expenseId, existingItems) {
  const companyId = await getCompanyId();
  const existingItemIds = existingItems.map(item => item.id);
  const incomingItemIds = body.items
    .filter(item => item.itemId)
    .map(item => item.itemId);

  // Items to delete (exist in DB but not in incoming data)
  const itemsToDelete = existingItemIds.filter(id => !incomingItemIds.includes(id));

  if (itemsToDelete.length > 0) {
    await prisma.ExpenseItem.deleteMany({
      where: {
        id: { in: itemsToDelete },
        companyId: companyId,
      },
    });
  }

  // Process incoming items
  const itemPromises = body.items.map(async (item) => {
    if (item?.itemId && existingItemIds.includes(item.itemId)) {
      // Update existing item
      return await prisma.ExpenseItem.update({
        where: {
          id: item.itemId,
          companyId: companyId,
        },
        data: {
          itemName: item?.item,
          price: item?.price,
          expenseId: expenseId,
        },
      });
    } else {
      // Create new item
      return await prisma.ExpenseItem.create({
        data: {
          itemName: item?.item,
          price: item?.price,
          companyId: companyId,
          expenseId: expenseId,
        },
      });
    }
  });

  const updatedItems = await Promise.all(itemPromises);
  return updatedItems.map(item => item.id);
}

async function updateInvoiceData(expenseId, body, itemIds) {
  // Delete existing invoice data for this expense
  await prisma.InvoiceData.deleteMany({
    where: {
      expenseId: expenseId,
    },
  });

  // Create new invoice data
  const invoiceData = body?.items.map((item, index) => ({
    itemName: item?.item,
    itemId: itemIds[index],
    qty: item?.qty,
    unitPrice: item?.price,
    price: item?.amount,
    expenseId: expenseId,
  }));

  if (invoiceData.length > 0) {
    await prisma.InvoiceData.createMany({
      data: invoiceData,
    });
  }
}

export async function PUT(request) {
  try {
    const data = await request.json();
    const companyId = await getCompanyId();
    const expenseId = data.id;

    if (!expenseId) {
      return NextResponse.json(
        { error: "Expense ID is required" },
        { status: 400 }
      );
    }

    // Fetch existing expense with related data
    const existingExpense = await prisma.Expense.findUnique({
      where: {
        id: expenseId,
        companyId: companyId,
      },
      include: {
        items: true,
        transaction: true,
        invoiceData: true,
      },
    });

    if (!existingExpense) {
      return NextResponse.json(
        { error: "Expense not found" },
        { status: 404 }
      );
    }

    // Handle category - this will return either new category ID or existing selectedParty.id
    const categoryId = await handleCategory(data);

    // Handle cash adjustment
    const cashOrBankId = await handleCashAdjustment(
      data, 
      existingExpense.price || 0, 
      data.total || 0
    );

    // Prepare expense update data
    const expenseUpdateData = {
      billNumber: data?.billNumber ? parseInt(data.billNumber) : null,
      billDate: data?.billDate,
      paymentType: data?.paymentType === "Cash"
        ? data?.paymentType
        : data?.paymentType?.accountdisplayname,
      paymentTypeId: data?.paymentType === "Cash" ? null : data?.paymentType?.id,
      price: data?.total,
    };

    // Only update categoryId if it's provided (not null/undefined)
    if (categoryId) {
      expenseUpdateData.categoryId = categoryId;
    }

    // Update expense
    const updatedExpense = await prisma.Expense.update({
      where: {
        id: expenseId,
        companyId: companyId,
      },
      data: expenseUpdateData,
    });

    // Handle items
    const itemIds = await handleItems(data, expenseId, existingExpense.items);

    // Update invoice data
    await updateInvoiceData(expenseId, data, itemIds);

    // Find and update related transaction
    const existingTransaction = existingExpense.transaction?.[0];
    if (existingTransaction) {
      // Update transaction
      const updatedTransaction = await prisma.transaction.update({
        where: {
          id: existingTransaction.id,
          companyId: companyId,
        },
        data: {
          paymentType: data?.paymentType === "Cash"
            ? data?.paymentType
            : data?.paymentType?.accountdisplayname,
          totalAmount: data?.total,
          amount: data?.total,
          balanceDue: 0,
          [data?.paymentType === "Cash" ? "cashAdjustmentId" : "cashAndBankId"]: cashOrBankId,
          cashAdjustmentId: data?.paymentType === "Cash" ? cashOrBankId : null,
          cashAndBankId: data?.paymentType !== "Cash" ? cashOrBankId : null,
        },
      });

      // Clear old expense item connections and connect new ones
      if (itemIds.length > 0) {
        // First disconnect all expense items
        await prisma.transaction.update({
          where: { id: updatedTransaction.id, companyId: companyId },
          data: {
            expenseItemId: null,
          },
        });

        // Connect the first expense item (or you can connect all if your schema allows multiple)
        if (itemIds[0]) {
          await prisma.transaction.update({
            where: { id: updatedTransaction.id, companyId: companyId },
            data: {
              expenseItem: {
                connect: { id: itemIds[0] },
              },
            },
          });
        }
      }
    }

    // Fetch updated expense with all relations
    const finalExpense = await prisma.Expense.findUnique({
      where: { id: expenseId },
      include: {
        transaction: {
          include: {
            cashAdjustment: true,
            cashAndBank: true,
            expenseItem: true,
          }
        },
        items: true,
        invoiceData: true,
        category: true,
      },
    });

    return NextResponse.json(
      { data: finalExpense, status: true },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error updating expense:", error);

    // Handle Prisma errors
    if (error.code) {
      if (error.code === "P2002") {
        return NextResponse.json(
          { message: "Unique constraint violation." },
          { status: 409 }
        );
      } else if (error.code === "P2025") {
        return NextResponse.json(
          { message: "Record not found." },
          { status: 404 }
        );
      } else if (error.code === "P2003") {
        return NextResponse.json(
          { 
            message: "Foreign key constraint failed.",
            details: error.meta
          },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      {
        message: "Failed to update expense",
        error: error.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}