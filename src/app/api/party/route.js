// app/api/categories/route.js
import prisma from "@/lib/prisma";
import { getCompanyId } from "@/utils/GetCompanyId";
import { NextResponse } from "next/server";

// GET ALL
export async function GET() {
  try {
    const Party = await prisma.Party.findMany({
      orderBy: {
        id: "desc",
      },
      include: {
        transaction: true,
      },
      where: {
        companyId: await getCompanyId(),
      },
    });
    return NextResponse.json(Party);
  } catch (error) {
    return NextResponse.json(
      { error: error || "Failed to fetch Party" },
      { status: 500 }
    );
  }
}

// CREATE NEW
export async function POST(req) {
  try {
    const body = await req.json();
    const companyId = await getCompanyId();

    // Parse the opening balance amount
    const openingBalanceAmount = parseFloat(body.openingBalance) || 0;

    // Create the party first
    const newParty = await prisma.party.create({
      data: {
        partyName: body.partyName,
        phoneNumber: body.phoneNumber,
        emailId: body.emailId,
        billingAddress: body.billingAddress,
        shippingEnabled: body.shippingEnabled,
        shippingAddress: body.shippingAddress,
        openingBalance: openingBalanceAmount,
        balanceType: body.balanceType,
        asOfDate: body.asOfDate,
        creditLimitType: body.creditLimitType,
        creditLimit: parseFloat(body.creditLimit) || 0,
        additionalFields: body.additionalFields,
        company: {
          connect: { id: companyId },
        },
      },
    });

    // If openingBalance exists and is not zero, create a transaction
    if (openingBalanceAmount !== 0) {
      // Determine transaction type based on balanceType
      let transactionType, namePrefix, description;

      if (body.balanceType === "ToReceive") {
        transactionType = "Sale"; // or 'RECEIVABLE' based on your needs
        namePrefix = "Opening Balance Receivable";
        description = `Opening receivable balance for ${body.partyName}`;
      } else {
        transactionType = "Purchase"; // or 'PAYABLE' based on your needs
        namePrefix = "Opening Balance Payable";
        description = `Opening payable balance for ${body.partyName}`;
      }

      // Generate a unique invoice number for opening balance
      const invoiceNo = `OB-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}`;

      // Create the opening balance transaction
      await prisma.transaction.create({
        data: {
          date: new Date(),
          invoiceNo: invoiceNo,
          name: `${namePrefix} - ${body.partyName}`,
          paymentType: "OPENING_BALANCE",
          amount: openingBalanceAmount,
          balanceDue: openingBalanceAmount, // Initially the full amount is due
          type: namePrefix,
          status: "Pending", // or 'Overdue' if past due date
          description: description,
          totalAmount: openingBalanceAmount,
          taxRate: 0.0,
          taxAmount: 0.0,
          paymentDate: null, // No payment date yet for opening balance
          paymentRef: null,
          // Relationships
          party: {
            connect: { id: newParty.id },
          },
          company: {
            connect: { id: companyId },
          },
          // Optional: You can add transactionId if needed
          transactionId: `opening-balance-${newParty.id}`,
        },
      });
    }

    return NextResponse.json({ data: newParty, status: true });
  } catch (error) {
    console.log("Error creating party with opening balance:", error);

    return NextResponse.json(
      { error: error.message || "Failed to create Party" },
      { status: 500 }
    );
  }
}

