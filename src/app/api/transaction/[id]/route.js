// app/api/categories/[id]/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCompanyId } from "@/utils/GetCompanyId";

// GET ONE
export async function GET(req, { params }) {
  try {
    const { id } = await params;
    const Transaction = await prisma.Transaction.findUnique({
      where: { id, companyId: await getCompanyId(), },
    });

    if (!Transaction) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(Transaction);
  } catch (error) {
    return NextResponse.json({ error: error || "Failed to fetch Transaction" }, { status: 500 });
  }
}

// UPDATE
export async function PUT(req, { params }) {
  try {
    const body = await req.json();
    const { id } = await params;

    const updated = await prisma.Transaction.update({
      where: { id, companyId: await getCompanyId(), },
      data: body,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.log(error);

    return NextResponse.json({ error: error || "Failed to update Transaction" }, { status: 500 });
  }
}

// DELETE
export async function DELETE(req, { params }) {
  try {
    const { id } = await params;
    await prisma.Transaction.delete({
      where: { id, companyId: await getCompanyId(), },
    });
    return NextResponse.json({ message: "Transaction deleted successfully", status: true });
  } catch (error) {
    return NextResponse.json({ error: error || "Failed to delete Transaction" }, { status: 500 });
  }
}
