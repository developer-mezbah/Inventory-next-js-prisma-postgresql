// app/api/categories/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { generateShortSecureID } from "@/utils/generateShortSecureID";
import { getCompanyId } from "@/utils/GetCompanyId";

// GET ALL
export async function GET() {
  try {
    const Transaction = await prisma.Transaction.findMany({
      orderBy: {
        id: 'desc',
      },
      where: {
        companyId: await getCompanyId(),
      },
    });
    return NextResponse.json(Transaction);
  } catch (error) {
    return NextResponse.json({ error: error || "Failed to fetch Transaction" }, { status: 500 });
  }
}

// CREATE NEW
export async function POST(req) {
  try {
    const body = await req.json();

    const newItem = await prisma.Transaction.create({
      data: {
        ...body, company: {
          connect: { id: await getCompanyId() }
        }, transactionId: generateShortSecureID()
      },
    });

    return NextResponse.json({ data: newItem, status: true });
  } catch (error) {
    console.log(error);

    return NextResponse.json({ error: error || "Failed to create Transaction" }, { status: 500 });
  }
}
