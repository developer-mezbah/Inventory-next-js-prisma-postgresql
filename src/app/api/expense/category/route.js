// app/api/categories/route.js
import prisma from "@/lib/prisma";
import { getCompanyId } from "@/utils/GetCompanyId";
import { NextResponse } from "next/server";

// Initialize global default categories (run once)
 export async function initializeGlobalDefaultCategories() {
  try {
    const globalCategories = [
      { name: "Petrol", expenseType: "Operational", defaultCat: true },
      { name: "Rent", expenseType: "Fixed", defaultCat: true },
      { name: "Salary", expenseType: "Personnel", defaultCat: true },
      { name: "Tea", expenseType: "Operational", defaultCat: true },
      { name: "Transport", expenseType: "Operational", defaultCat: true },
      { name: "Utilities", expenseType: "Fixed", defaultCat: true },
      { name: "Office Supplies", expenseType: "Operational", defaultCat: true },
      { name: "Marketing", expenseType: "Marketing", defaultCat: true },
      { name: "Maintenance", expenseType: "Operational", defaultCat: true },
      { name: "Travel", expenseType: "Operational", defaultCat: true },
    ];

    // Check if global categories already exist
    const existingGlobalCategories = await prisma.ExpenseCategory.findMany({
      where: { companyId: null }
    });

    if (existingGlobalCategories.length === 0) {
      await prisma.ExpenseCategory.createMany({
        data: globalCategories.map(cat => ({
          ...cat,
          companyId: null, // Global categories have null companyId
        })),
      });
      console.log("Global default categories initialized");
    }
  } catch (error) {
    console.error("Failed to initialize global categories:", error);
  }
}

// GET endpoint returns global + company-specific categories
export async function GET() {
  try {
    const companyId = await getCompanyId();
    
    // Initialize global defaults if needed (run once on server startup)
    await initializeGlobalDefaultCategories();
    
    // Fetch ALL categories available to this company:
    // 1. Global categories (companyId: null) AND
    // 2. Company-specific categories
    const categories = await prisma.ExpenseCategory.findMany({
      orderBy: {
        id: "desc",
      },
      where: {
        OR: [
          { companyId: null },           // Global defaults
          { companyId: companyId },      // Company-specific
        ]
      },
    });
    return NextResponse.json(categories);
    
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch Expense Category" },
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

