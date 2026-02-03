import prisma from "@/lib/prisma";
import { generateShortSecureID } from "@/utils/generateShortSecureID";
import { getCompanyId } from "@/utils/GetCompanyId";
import { NextResponse } from "next/server";
import { initializeGlobalDefaultCategories } from "./category/route";


export async function GET(req) {
  try {
    const companyId = await getCompanyId();
    
    // Initialize global default categories (run once if needed)
    await initializeGlobalDefaultCategories();
    
    // Fetch expenses (company-specific only)
    const expenses = await prisma.Expense.findMany({
      where: { companyId: companyId },
      orderBy: { createdAt: "desc" },
      include: {
        transaction: true,
        items: true,
        invoiceData: true,
      },
    });
    
    // Fetch categories for this company: BOTH global AND company-specific
    const expenseCategories = await prisma.ExpenseCategory.findMany({
      where: {
        OR: [
          { companyId: null },           // Global default categories
          { companyId: companyId },      // Company-specific categories
        ]
      },
      orderBy: { createdAt: "desc" },
    });
    
    return NextResponse.json({ 
      data: expenses, 
      categories: expenseCategories, 
      status: true 
    });
    
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch Expenses" },
      { status: 500 }
    );
  }
}


async function handleCategory(body) {
  if (body?.newCategory) {
    const newCategory = await prisma.ExpenseCategory.create({
      data: {
        // expenseType: body?.expenseType,
        name: body?.newCategory,
        companyId: await getCompanyId(),
      },
    });
    return newCategory?.id;
  }
}

async function handleCash(body) {
  if (body?.paymentType === "Cash") {
    const res = await prisma.CashAdjustment.upsert({
      where: {
        userId: body?.userId,
        companyId: await getCompanyId(),
      },
      update: {
        cashInHand: {
          decrement:body?.total || 0
        },
      },
      create: {
        userId: body?.userId,
        companyId: await getCompanyId(),
        cashInHand: body?.total || 0
      },
    });

    return res?.id;
  } else {
    await prisma.CashAndBank.update({
      where: {
        id: body?.paymentType?.id,
        companyId: await getCompanyId(),
      },
      data: {
        openingbalance: {
          decrement: body?.total,
        },
      },
    });
  }
}



async function handleItem(body, id) {
  // 1. Check if body or items is null/undefined
  if (!body?.items) {
    return [];
  }

  // 2. Use map to create an array of promises.
  // Each promise resolves to an Item ID (either existing or new).
  const itemPromises = body.items.map(async (item) => {
    if (item?.itemId) {
      const existing = await prisma.ExpenseItem.findUnique({
        where: { id: item?.itemId, companyId: await getCompanyId() }
      });

      // Handle potential case where existing item is not found
      if (!existing) {
        // You might want to throw an error or handle this case differently
        console.error(`Item with ID ${item.itemId} not found.`);
        return null; // Return null or another indicator for failure
      }

      await prisma.ExpenseItem.update({
        where: {
          id: item?.itemId,
          companyId: await getCompanyId(),
        },
        data: {
          price: item?.price,
          expense: {
            connect: { id },
          },
        },
      });

      // This is the ID of the updated item
      return item.itemId;
    } else {
      const createdData = await prisma.ExpenseItem.create({
        data: {
          itemName: item?.item,
          price: item?.price,
          company: {
            connect: { id: await getCompanyId() },
          },
          expense: {
            connect: { id },
          }
        },
      });

      // This is the ID of the newly created item
      return createdData?.id;
    }
  });

  // 3. Use Promise.all() to wait for all the promises to resolve.
  // This will return an array containing all the resolved item IDs.
  const itemIds = await Promise.all(itemPromises);

  // Filter out any null values if you chose to return null for missing items
  return itemIds.filter((id) => id !== null);
}


export async function POST(request) {
  try {
    const data = await request.json();


    const newCategoryId = await handleCategory(data);
    const cashId = await handleCash(data);

        const expenseData = {
      billNumber: data?.billNumber || null,
      billDate: data?.billDate,
      paymentType:
        data?.paymentType === "Cash"
          ? data?.paymentType
          : data?.paymentType?.accountdisplayname,
      paymentTypeId:
        data?.paymentType === "Cash" ? null : data?.paymentType?.id,
      price: data?.total,
      categoryId: data?.newCategory ? newCategoryId : data?.selectedParty?.id,
      companyId: await getCompanyId()
    
    };
    const expense = await prisma.Expense.create({
      data: expenseData,
    })


    // Get item IDs (including newly created ones)
    const itemIds = await handleItem(data, expense?.id);

    // Prepare invoice data with correct item IDs
    const invoiceData = data?.items.map((item, index) => ({
      itemName: item?.item,
      itemId: item?.itemId || itemIds[index], // Use existing itemId or newly created one
      qty: item?.qty,
      unitPrice: item?.price,
      price: item?.amount,
      expenseId: expense?.id,
    }));

    await prisma.InvoiceData.createMany({
      data: invoiceData,
    });


    const transaction = await prisma.Transaction.create({
      data: {
        type: "Expense",
        paymentType:
          data?.paymentType === "Cash"
            ? data?.paymentType
            : data?.paymentType?.accountdisplayname,
        date: expense?.createdAt,
        totalAmount: data?.total,
        amount: data?.total,
        balanceDue: 0,
        transactionId: generateShortSecureID(),
        expense: {
          connect: { id: expense?.id },
        },
        [data?.paymentType === "Cash" ? "cashAdjustment" : "cashAndBank"]: {
          connect: {
            id: data?.paymentType === "Cash" ? cashId : data?.paymentType?.id,
          },
        },
        company: {
          connect: { id: await getCompanyId() },
        },
      },
    });

        if (itemIds.length > 0) {
          for (let i = 0; i < itemIds.length; i++) {
            const itemId = itemIds[i];
            await prisma.Transaction.update({
              where: { id: transaction?.id, companyId: await getCompanyId() },
              data: {
                expenseItem: {
                  connect: { id: itemId },
                },
              },
            });
          }
        }
    return NextResponse.json(
      { data: expense, status: true },
      { status: 201 }
    );
  } catch (error) {
    // Check for Prisma errors by error code instead of instanceof
    if (error.code) {
      if (error.code === "P2002") {
        return NextResponse.json(
          { message: "Expense item creation constraint violation." },
          { status: 409 }
        );
      } else if (error.code === "P2003") {
        return NextResponse.json(
          { message: "Foreign key constraint failed. Please check if the expense exists." },
          { status: 400 }
        );
      }
    }

    console.error("Error creating expense item:", error);
    return NextResponse.json(
      {
        message: "Failed to create expense item",
        error: error.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}