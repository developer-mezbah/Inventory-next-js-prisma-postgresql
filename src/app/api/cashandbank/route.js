// app/api/categories/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { generateShortSecureID } from "@/utils/generateShortSecureID";
import { getCompanyId } from "@/utils/GetCompanyId";

// GET ALL
export async function GET() {
  try {
    const cashandbank = await prisma.CashAndBank.findMany({
      orderBy: {
        id: 'desc',
      },
      where: {
        companyId: await getCompanyId(),
      },
      include: { transaction: true }
    });
    return NextResponse.json(cashandbank);
  } catch (error) {
    return NextResponse.json({ error: error || "Failed to fetch CashAndBank" }, { status: 500 });
  }
}

// CREATE NEW
export async function POST(req) {
  try {
    const body = await req.json();

    const newItem = await prisma.CashAndBank.create({
      data: {
        ...body, company: {
          connect: { id: await getCompanyId() }
        }
      },
    });

    if (newItem) {
      await prisma.Transaction.create({
        data: {
          type: "Opening Balance", company: {
            connect: { id: await getCompanyId() }
          }, name: newItem?.accountdisplayname, date: newItem?.createdAt, amount: newItem?.openingbalance, transactionId: generateShortSecureID(), cashAndBank: {
            connect: { id: newItem?.id }
          }
        },
      });
    }
    return NextResponse.json({ data: newItem, status: true });
  } catch (error) {
    console.log(error);

    return NextResponse.json({ error: error || "Failed to create CashAndBank" }, { status: 500 });
  }
}
