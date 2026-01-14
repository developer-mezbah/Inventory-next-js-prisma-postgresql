// app/api/categories/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { generateShortSecureID } from "@/utils/generateShortSecureID";
import { getCompanyId } from "@/utils/GetCompanyId";

// GET ALL
export async function GET() {
  try {
    const CashAdjustment = await prisma.CashAdjustment.findMany({
      orderBy: {
        id: 'desc',
      },
      where: { companyId: await getCompanyId() },
      include: { transaction: true }
    });
    return NextResponse.json(CashAdjustment);
  } catch (error) {
    return NextResponse.json({ error: error || "Failed to fetch CashAdjustment" }, { status: 500 });
  }
}

// CREATE NEW
export async function POST(req) {
  try {
    const body = await req.json();

    const newItem = await prisma.CashAdjustment.create({
      data: {
        cashInHand: parseFloat(body?.amount),
        userId: body?.userId, company: {
          connect: { id: await getCompanyId() }
        }
      },
    });

    if (newItem) {
      await prisma.Transaction.create({
        data: {
          type: body?.adjustmentType,
          description: body?.description,
          date: new Date(body?.adjustmentDate.replace(/[\[\]]/g, '')),
          amount: body?.amount,
          transactionId: generateShortSecureID(),
          cashAdjustment: {
            connect: { id: newItem?.id }
          }, company: {
            connect: { id: await getCompanyId() }
          }
        },
      });
    }
    return NextResponse.json({ data: newItem, status: true });
  } catch (error) {
    console.log(error);

    return NextResponse.json({ error: error || "Failed to create CashAdjustment" }, { status: 500 });
  }
}
