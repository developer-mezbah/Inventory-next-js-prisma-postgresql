import prisma from "@/lib/prisma";
import { getCompanyId } from "@/utils/GetCompanyId";
import { NextResponse } from "next/server";


async function handleCategory(body) {
  if (body?.newParty) {
    const newCategory = await prisma.Party.create({
      data: {
        expenseType: body?.expenseType,
        name: body?.name,
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
          decrement: body?.paidAmount,
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
          [body?.mode === "sale" ? "sale" : "purchase"]: {
            connect: { id },
          },
          stock: {

            openingQuantity: body?.mode === "sale" ? 0 : item?.qty,
          },
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
console.log(data);

   

    return NextResponse.json(
      { expenseItem: data, status: true },
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