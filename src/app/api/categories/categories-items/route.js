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
      include: {
        items: true,
      },
    });
    return NextResponse.json(categories);
  } catch (error) {
    return NextResponse.json({ error: error || "Failed to fetch categories" }, { status: 500 });
  }
}