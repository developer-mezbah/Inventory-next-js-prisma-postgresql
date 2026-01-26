import prisma from "@/lib/prisma";
import { getCompanyId } from "@/utils/GetCompanyId";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const data = await request.json();

    // Basic validation for mandatory fields
    if (!data.itemName) {
      return NextResponse.json(
        { message: "Missing required field: itemName." },
        { status: 400 }
      );
    }

    const newExpenseItem = await prisma.expenseItem.create({
      data: {
        itemName: data.itemName,
        price: data.price,
         company: {
          connect: { id: await getCompanyId() },
        }
      },
    });

    return NextResponse.json(
      { expenseItem: newExpenseItem, status: true },
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