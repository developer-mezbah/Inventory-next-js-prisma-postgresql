// app/api/categories/[id]/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCompanyId } from "@/utils/GetCompanyId";

// GET ONE
export async function GET(req, { params }) {
  try {
    const {id} = await params;
    const category = await prisma.category.findUnique({
      where: { id, companyId: await getCompanyId() },
    });

    if (!category) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(category);
  } catch (error) {
    return NextResponse.json({ error: error || "Failed to fetch category" }, { status: 500 });
  }
}

// UPDATE
export async function PUT(req, { params }) {
  try {
    const body = await req.json();
    const {id} = await params;

    const updated = await prisma.category.update({
      where: { id, companyId: await getCompanyId() },
      data: {
        name: body.name,
        subcategories: body.subcategories || [],
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: error || "Failed to update category" }, { status: 500 });
  }
}

// DELETE
export async function DELETE(req, { params }) {
  try {
    const {id} = await params;
    await prisma.category.delete({
      where: { id, companyId: await getCompanyId() },
    });
    return NextResponse.json({ message: "Category deleted successfully", status: true });
  } catch (error) {
    return NextResponse.json({ error: error || "Failed to delete category" }, { status: 500 });
  }
}
