// app/api/categories/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCompanyId } from "@/utils/GetCompanyId";

// GET ALL
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
       orderBy: {
        id: 'desc',
      }, 
      where: {
        companyId: await getCompanyId(),
      },
    });
    return NextResponse.json(categories);
  } catch (error) {
    return NextResponse.json({ error: error || "Failed to fetch categories" }, { status: 500 });
  }
}

// CREATE NEW
export async function POST(req) {
  try {
    const body = await req.json();

    const newCategory = await prisma.category.create({
      data: {
        categoryId: body.categoryId,
        name: body.name,
        subcategories: body.subcategories || [],
        company: {
          connect: { id: await getCompanyId() }
        }
      },
    });

    return NextResponse.json(newCategory);
  } catch (error) {
    return NextResponse.json({ error: error || "Failed to create category" }, { status: 500 });
  }
}
