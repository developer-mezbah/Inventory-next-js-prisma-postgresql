// app/api/categories/route.js
import prisma from "@/lib/prisma";
import { getCompanyId } from "@/utils/GetCompanyId";
import { NextResponse } from "next/server";

// GET ALL
export async function GET() {
  try {
    const Party = await prisma.ExpenseCategory.findMany({
      orderBy: {
        id: "desc",
      },
      where: {
        companyId: await getCompanyId(),
      },
    });
    return NextResponse.json(Party);
  } catch (error) {
    return NextResponse.json(
      { error: error || "Failed to fetch Expence Category" },
      { status: 500 }
    );
  }
}

// CREATE NEW
export async function POST(req) {
  try {
    const body = await req.json();
    const companyId = await getCompanyId();

    const newECategory = await prisma.ExpenseCategory.create({
      data: {
        name: body.name,
        expenseType: body.expenseType,
        companyId: companyId,
      },
    });
    console.log("New Expense Category created:", newECategory);
    return NextResponse.json({ data: newECategory, status: true });
  } catch (error) {
    console.log("Error creating expense category:", error);

    // Handle duplicate name error (P2002 is Prisma's unique constraint violation code)
    if (error.code === 'P2002') {
      // Check if it's a duplicate name error by examining the error message or meta
      const errorMessage = error.message.toLowerCase();
      const meta = error.meta || {};
      
      // You can check the target field from meta or error message
      if (errorMessage.includes('name') || 
          (meta.target && meta.target.includes('name'))) {
        return NextResponse.json(
          { 
            error: "Expense category with this name already exists. Please use a different name.",
            code: "DUPLICATE_NAME"
          },
          { status: 409 } // 409 Conflict is appropriate for duplicate resources
        );
      }
      
      // Generic duplicate error for other unique constraints
      return NextResponse.json(
        { 
          error: "A record with these details already exists.",
          code: "DUPLICATE_RECORD"
        },
        { status: 409 }
      );
    }

    // Handle other errors
    return NextResponse.json(
      { 
        error: error.message || "Failed to create Expense Category",
        code: error.code || "UNKNOWN_ERROR"
      },
      { status: 500 }
    );
  }
}

