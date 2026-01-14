// app/api/categories/[id]/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCompanyId } from "@/utils/GetCompanyId";

// GET ONE
export async function GET(req, { params }) {
  try {
    const { id } = await params;
    const cashandbank = await prisma.CashAndBank.findUnique({
      where: { id, companyId: await getCompanyId() },
    });

    if (!cashandbank) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(cashandbank);
  } catch (error) {
    return NextResponse.json({ error: error || "Failed to fetch CashAndBank" }, { status: 500 });
  }
}

// UPDATE
export async function PUT(req, { params }) {
  try {
    const body = await req.json();
    const { id } = await params;
    const { transaction, ...newBody } = body

    const updated = await prisma.CashAndBank.update({
      where: { id, companyId: await getCompanyId() },
      data: newBody,
    });
    const openingBalanceTransaction = transaction.find(item => item.type === 'Opening Balance')

    await prisma.Transaction.update({
      where: { id: openingBalanceTransaction?.id, companyId: await getCompanyId() },
      data: { name: updated?.accountdisplayname, amount: updated?.openingbalance },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.log(error);

    return NextResponse.json({ error: error || "Failed to update CashAndBank" }, { status: 500 });
  }
}

// DELETE
export async function DELETE(req, { params }) {
  try {
    const { id } = await params;
    await prisma.CashAndBank.delete({
      where: { id, companyId: await getCompanyId() },
    });
    return NextResponse.json({ message: "CashAndBank deleted successfully", status: true });
  } catch (error) {
    return NextResponse.json({ error: error || "Failed to delete CashAndBank" }, { status: 500 });
  }
}
