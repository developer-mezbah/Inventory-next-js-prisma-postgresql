// app/api/categories/[id]/route.js
import prisma from "@/lib/prisma";
import { getCompanyId } from "@/utils/GetCompanyId";
import { NextResponse } from "next/server";

// GET ONE
export async function GET(req, { params }) {
  try {
    const { id } = await params;
    const Party = await prisma.Party.findUnique({
      where: { id },
      where: {
        companyId: await getCompanyId(),
      },
    });

    if (!Party) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(Party);
  } catch (error) {
    return NextResponse.json(
      { error: error || "Failed to fetch Party" },
      { status: 500 }
    );
  }
}

// UPDATE
export async function PUT(req, { params }) {
  try {
    const body = await req.json();
    const { id } = await params;
    const companyId = await getCompanyId();

    const { openingBalance, balanceType, ...partyData } = body;
    const newOpeningBalanceAmount = parseFloat(openingBalance) || 0;

    // Use a transaction to ensure consistency
    const result = await prisma.$transaction(async (prisma) => {
      // Get current party within transaction
      const currentParty = await prisma.party.findUnique({
        where: { id },
      });

      if (!currentParty) {
        throw new Error("Party not found");
      }

      // Update the party
      const updatedParty = await prisma.party.update({
        where: { id },
        data: {
          ...partyData,
          openingBalance: newOpeningBalanceAmount,
          balanceType: balanceType || currentParty.balanceType,
          company: {
            connect: { id: companyId },
          },
        },
      });

      // Handle opening balance transaction
      if (openingBalance !== undefined) {
        // Find and handle opening balance transaction
        await handleOpeningBalanceTransaction(
          prisma,
          id,
          companyId,
          updatedParty,
          newOpeningBalanceAmount,
          balanceType || currentParty.balanceType
        );
      }

      return updatedParty;
    });

    return NextResponse.json({ status: true, result });
  } catch (error) {
    console.log(error);

    if (error.message === "Party not found") {
      return NextResponse.json({ error: "Party not found" }, { status: 404 });
    }

    return NextResponse.json(
      { error: error.message || "Failed to update Party" },
      { status: 500 }
    );
  }
}

// Helper function to handle opening balance transaction
async function handleOpeningBalanceTransaction(
  prisma,
  partyId,
  companyId,
  party,
  amount,
  balanceType
) {
  // Find existing opening balance transaction
  const existingTransaction = await prisma.transaction.findFirst({
    where: {
      partyId: partyId,
      OR: [
        { type: { contains: "Opening Balance" } },
        { transactionId: { startsWith: "opening-balance-" } },
      ],
    },
  });
  // Determine transaction details
  let namePrefix, description;

  if (balanceType === "ToReceive") {
    namePrefix = "Opening Balance Receivable";
    description = `Opening receivable balance for ${party.partyName}`;
  } else {
    namePrefix = "Opening Balance Payable";
    description = `Opening payable balance for ${party.partyName}`;
  }

  if (existingTransaction) {
    if (amount !== 0) {
      // Update existing transaction
      return await prisma.transaction.update({
        where: { id: existingTransaction.id },
        data: {
          name: `${namePrefix} - ${party.partyName}`,
          amount: amount,
          type: namePrefix,
          balanceDue: amount,
          totalAmount: amount,
          description: description,
          updatedAt: new Date(),
        },
      });
    } else {
      // Delete if amount is 0
      return await prisma.transaction.delete({
        where: { id: existingTransaction.id },
      });
    }
  } else if (amount !== 0) {
    // Create new transaction
    const invoiceNo = `OB-UPD-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    return await prisma.transaction.create({
      data: {
        date: new Date(),
        invoiceNo: invoiceNo,
        name: `${namePrefix} - ${party.partyName}`,
        paymentType: "OPENING_BALANCE",
        amount: amount,
        balanceDue: amount,
        type: namePrefix,
        status: "Pending",
        description: description,
        totalAmount: amount,
        taxRate: 0.0,
        taxAmount: 0.0,
        paymentDate: null,
        paymentRef: null,
        party: {
          connect: { id: partyId },
        },
        company: {
          connect: { id: companyId },
        },
        transactionId: `opening-balance-${partyId}`,
      },
    });
  }
}

// DELETE
export async function DELETE(req, { params }) {
  try {
    const { id } = await params;
    const companyId = await getCompanyId();

    // First, check if party exists and belongs to company
    const party = await prisma.Party.findUnique({
      where: { id, companyId },
      include: {
        // Include transactions if you want to log or handle them separately
        // _count: {
        //   select: { transactions: true }
        // }
      },
    });

    if (!party) {
      return NextResponse.json(
        { error: "Party not found or you don't have permission to delete it" },
        { status: 404 }
      );
    }

    // Delete associated opening balance transaction first
    await prisma.transaction.deleteMany({
      where: {
        partyId: id,
        companyId,
        OR: [
          { type: { contains: "Opening Balance" } },
          { transactionId: { startsWith: "opening-balance-" } },
        ],
      },
    });

    // Then delete the party
    await prisma.Party.delete({
      where: { id, companyId },
    });

    return NextResponse.json({
      message: "Party and associated opening balance deleted successfully",
      status: true,
    });
  } catch (error) {
    console.error("Error deleting party:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete Party" },
      { status: 500 }
    );
  }
}
