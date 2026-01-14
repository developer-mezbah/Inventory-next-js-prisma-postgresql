// app/api/categories/[id]/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { generateShortSecureID } from "@/utils/generateShortSecureID";
import { getCompanyId } from "@/utils/GetCompanyId";

// GET ONE
export async function GET(req, { params }) {
  try {
    const { id } = await params;
    const CashAdjustment = await prisma.CashAdjustment.findUnique({
      where: {
        userId: id, companyId: await getCompanyId()
      },
      include: {
        transaction: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!CashAdjustment) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(CashAdjustment);
  } catch (error) {
    console.log(error);

    return NextResponse.json({ error: error || "Failed to fetch CashAdjustment" }, { status: 500 });
  }
}

// UPDATE

export async function PUT(req, { params }) {
  try {
    const body = await req.json();
    // id from params is now confirmed to be the userId
    const { id } = await params;
    const userId = id;

    // Destructure 'transaction' and any other fields not meant for the database
    const { transaction, ...dataToUpsert } = body;

    // --- 1. Define the 'where' clause (uses userId) ---
    const whereCondition = { userId: userId, companyId: await getCompanyId() };

    // --- 2. Define the 'update' data ---
    const updateData = {
      cashInHand: parseFloat(dataToUpsert?.cashInHand),
    };

    // --- 3. Define the 'create' data (must include the userId) ---
    const createData = {
      userId: userId, // CRITICAL: Include the userId when creating a new record
      cashInHand: parseFloat(dataToUpsert?.cashInHand),
      company: {
        connect: { id: await getCompanyId() }
      }
    };

    // --- Perform the upsert operation ---
    const result = await prisma.CashAdjustment.upsert({
      where: whereCondition,
      update: updateData,
      create: createData,
    });

    if (result) {
      await prisma.Transaction.create({
        data: {
          type: dataToUpsert?.adjustmentType,
          description: dataToUpsert?.description,
          date: new Date(dataToUpsert?.adjustmentDate.replace(/[\[\]]/g, '')),
          amount: dataToUpsert?.amount,
          transactionId: generateShortSecureID(),
          cashAdjustment: {
            connect: { id: result?.id }
          },
          company: {
            connect: { id: await getCompanyId() }
          }
        },
      });
    }

    return NextResponse.json({ result, status: true });
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      { error: "Failed to upsert CashAdjustment" },
      { status: 500 }
    );
  }
}

// DELETE
export async function DELETE(req, { params }) {
  try {
    const { id } = await params;
    await prisma.CashAdjustment.delete({
      where: { id, companyId: await getCompanyId() },
    });
    return NextResponse.json({ message: "CashAdjustment deleted successfully", status: true });
  } catch (error) {
    return NextResponse.json({ error: error || "Failed to delete CashAdjustment" }, { status: 500 });
  }
}
