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
    return NextResponse.json({ data: newECategory, status: true });
  } catch (error) {
    console.log("Error creating party with opening balance:", error);

    return NextResponse.json(
      { error: error.message || "Failed to create Party" },
      { status: 500 }
    );
  }
}

