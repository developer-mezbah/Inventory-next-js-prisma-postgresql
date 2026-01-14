import prisma from "@/lib/prisma";
import { generateShortSecureID } from "@/utils/generateShortSecureID";
import { getCompanyId } from "@/utils/GetCompanyId";
import { NextResponse } from "next/server";

// const requestBody = {
//   items: [...],
//   selectedParty: {...},
//   total: 200,
//   paidAmount: 200,
//   balanceDue: 0,
//   paymentType: "Cash",
//   mode: "sale",
//   partyAmount: 100, // Additional amount to add to party's receivable
//   partyAmountType: "receivable" // or "payable"
// };

export async function GET(req) {
  try {
    const salesPurchases = await prisma.Sale.findMany({
      where: { companyId: await getCompanyId() },
      orderBy: { createdAt: "desc" },
      include: {
        transaction: true,
      },
    });
    return NextResponse.json({ data: salesPurchases, status: true });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: error || "Failed to fetch Sales" },
      { status: 500 }
    );
  }
}
// Add these helper functions at the top

// Helper function to update party's opening balance
async function updatePartyOpeningBalance(partyId, amount, type) {
  try {
    if (!partyId || !type) return null;

    const companyId = await getCompanyId();

    // Get current party
    const currentParty = await prisma.party.findUnique({
      where: { id: partyId, companyId },
      select: { openingBalance: true, balanceType: true, partyName: true },
    });

    if (!currentParty) return null;

    let newOpeningBalance = parseFloat(currentParty.openingBalance) || 0;
    let newBalanceType = currentParty.balanceType;

    if (type === "receivable") {
      // Increase receivable or decrease payable
      if (currentParty.balanceType === "ToReceive") {
        newOpeningBalance += amount;
      } else {
        newOpeningBalance -= amount;
        if (newOpeningBalance < 0) {
          newOpeningBalance = Math.abs(newOpeningBalance);
          newBalanceType = "ToReceive";
        }
      }
    } else if (type === "payable") {
      // Increase payable or decrease receivable
      if (currentParty.balanceType === "ToReceive") {
        newOpeningBalance -= amount;
        if (newOpeningBalance < 0) {
          newOpeningBalance = Math.abs(newOpeningBalance);
          newBalanceType = "ToPay"; // Or whatever your payable type is
        }
      } else {
        newOpeningBalance += amount;
      }
    }

    // Update party's opening balance
    const updatedParty = await prisma.party.update({
      where: { id: partyId, companyId },
      data: {
        openingBalance: newOpeningBalance,
        balanceType: newBalanceType,
      },
    });

    return updatedParty;
  } catch (error) {
    console.error("Error updating party opening balance:", error);
    return null;
  }
}

// Helper function to create party adjustment transaction
async function createPartyAdjustmentTransaction(
  body,
  partyId,
  mainTransactionId
) {
  try {
    if (!partyId || !body?.partyAmount || !body?.partyAmountType) {
      return null;
    }

    const companyId = await getCompanyId();
    const amount = parseFloat(body.partyAmount) || 0;

    if (amount === 0) {
      return null;
    }

    // Get party details for name
    const party = await prisma.party.findUnique({
      where: { id: partyId, companyId },
      select: { partyName: true },
    });

    const partyName = party?.partyName || "Party";

    // Determine transaction details
    const isReceivable = body.partyAmountType === "receivable";
    const namePrefix = isReceivable
      ? "Party Receivable Adjustment"
      : "Party Payable Adjustment";
    const description = isReceivable
      ? `Additional amount receivable from ${partyName}`
      : `Additional amount payable to ${partyName}`;

    // Create the adjustment transaction
    const adjustmentTransaction = await prisma.transaction.create({
      data: {
        date: new Date(),
        invoiceNo: `PA-${Date.now()}-${Math.random()
          .toString(36)
          .substr(2, 9)}`,
        name: `${namePrefix} - ${partyName}`,
        paymentType: "PARTY_ADJUSTMENT",
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
        // Relationships
        party: {
          connect: { id: partyId },
        },
        // Link to main sale/purchase transaction if available
        ...(mainTransactionId && {
          relatedTransactionId: mainTransactionId,
        }),
        company: {
          connect: { id: companyId },
        },
        transactionId: `party-adj-${partyId}-${Date.now()}`,
      },
    });

    return adjustmentTransaction;
  } catch (error) {
    console.error("Error creating party adjustment transaction:", error);
    return null;
  }
}

// Update your existing handleItem function to fix a potential issue
async function handleItem(body, id) {
  // 1. Check if body or items is null/undefined
  if (!body?.items) {
    return [];
  }

  // 2. Use map to create an array of promises.
  // Each promise resolves to an Item ID (either existing or new).
  const itemPromises = body.items.map(async (item) => {
    if (item?.itemId) {
      const existing = await prisma.Item.findUnique({
        where: { id: item?.itemId, companyId: await getCompanyId() },
        select: { stock: true },
      });

      // Handle potential case where existing item is not found
      if (!existing) {
        console.error(`Item with ID ${item.itemId} not found.`);
        return null;
      }

      const currentQty = existing?.stock?.openingQuantity || 0;
      const reduceQty = parseFloat(item?.qty) || 0;
      const newOpeningQty = currentQty - reduceQty;

      await prisma.item.update({
        where: {
          id: item?.itemId,
          companyId: await getCompanyId(),
        },
        data: {
          [body?.mode === "sale" ? "salePrice" : "purchasePrice"]: item?.price,
          stock: {
            ...existing?.stock,
            openingQuantity: newOpeningQty,
          },
          // Connect to sale or purchase
          ...(id && {
            [body?.mode === "sale" ? "sale" : "purchase"]: {
              connect: { id },
            },
          }),
        },
      });

      return item.itemId;
    } else {
      const createdData = await prisma.item.create({
        data: {
          itemType: "product",
          itemName: item?.item,
          [body?.mode === "sale" ? "salePrice" : "purchasePrice"]: item?.price,
          baseUnit: item?.unit || "None",
          company: {
            connect: { id: await getCompanyId() },
          },
          // Connect to sale or purchase
          ...(id && {
            [body?.mode === "sale" ? "sale" : "purchase"]: {
              connect: { id },
            },
          }),
          stock: {
            openingQuantity:
              body?.mode === "sale" ? 0 : parseFloat(item?.qty) || 0,
          },
        },
      });

      return createdData?.id;
    }
  });

  // 3. Use Promise.all() to wait for all the promises to resolve.
  const itemIds = await Promise.all(itemPromises);

  // Filter out any null values
  return itemIds.filter((id) => id !== null);
}

async function handleParty(body) {
  if (body?.newParty) {
    const newParty = await prisma.Party.create({
      data: {
        phoneNumber: body?.phoneNumber,
        partyName: body?.newParty,
        companyId: await getCompanyId(),
      },
    });
    return newParty?.id;
  }
}

async function handleCash(body) {
  if (body?.paymentType === "Cash") {
    // await prisma.CashAdjustment.findUnique({
    //     where: {
    //         userId: body?.userId,
    //         companyId: await getCompanyId(),
    //     },
    // });
    const res = await prisma.CashAdjustment.upsert({
      where: {
        userId: body?.userId,
        companyId: await getCompanyId(),
      },
      update: {
        cashInHand: {
          [body?.mode === "sale" ? "increment" : "decrement"]: body?.paidAmount,
        },
      },
      create: {
        userId: body?.userId,
        companyId: await getCompanyId(),
        cashInHand:
          body?.mode === "sale" ? body?.paidAmount : -body?.paidAmount,
        // Add any other required fields for creation here
      },
    });

    return res?.id;
  } else {
    await prisma.CashAndBank.update({
      where: {
        id: body?.paymentType?.id,
        companyId: await getCompanyId(),
      },
      data: {
        openingbalance: {
          [body?.mode === "sale" ? "increment" : "decrement"]: body?.paidAmount,
        },
      },
    });
  }
}

// Updated POST function
export async function POST(req) {
  try {
    const body = await req.json();

    const newPartyId = await handleParty(body);
    const cashId = await handleCash(body);

    // Determine party ID
    const partyId = body?.newParty ? newPartyId : body?.selectedParty?.id;

    // Update party opening balance if partyAmount is provided
    let partyAdjustmentResult = null;
    if (body?.partyAmount && body?.partyAmountType && partyId) {
      const amount = parseFloat(body.partyAmount) || 0;
      if (amount > 0) {
        partyAdjustmentResult = await updatePartyOpeningBalance(
          partyId,
          amount,
          body.partyAmountType
        );
      }
    }

    const salePucaseData = {
      balanceDue: body?.balanceDue || 0,
      paymentType:
        body?.paymentType === "Cash"
          ? body?.paymentType
          : body?.paymentType?.accountdisplayname,
      paymentTypeId:
        body?.paymentType === "Cash" ? null : body?.paymentType?.id,
      partyName: body?.newParty
        ? body?.newParty
        : body?.selectedParty?.partyName,
      partyId: partyId,
      isPaid: body?.balanceDue === 0 ? true : false,
      balanceDue: body?.balanceDue,
      amount: body?.total,
      paidAmount: body?.paidAmount || 0,
      tax: parseFloat(body?.tax) || 0,
      discount: parseFloat(body?.discount) || 0,
      description: body?.description || "",
      billNumber: body?.billNumber ? parseInt(body?.billNumber) : null,
      phoneNumber: body?.phoneNumber ? parseInt(body?.phoneNumber) : null,
      images: body?.images || [],
      billDate: body?.billDate || "",
      company: {
        connect: { id: await getCompanyId() },
      },
    };

    const salePurchase =
      body?.mode === "sale"
        ? await prisma.Sale.create({
          data: salePucaseData,
        })
        : await prisma.Purchase.create({
          data: salePucaseData,
        });

    // Get item IDs (including newly created ones)
    const itemIds = await handleItem(body, salePurchase?.id);

    // Prepare invoice data with correct item IDs
    const invoiceData = body?.items.map((item, index) => ({
      itemName: item?.item,
      itemId: item?.itemId || itemIds[index], // Use existing itemId or newly created one
      qty: parseFloat(item?.qty) || 0,
      unitPrice: parseFloat(item?.price) || 0,
      price: parseFloat(item?.amount) || 0,
      [body?.mode === "sale" ? "saleId" : "purchaseId"]: salePurchase?.id,
    }));

    await prisma.InvoiceData.createMany({
      data: invoiceData,
    });

    const transaction = await prisma.Transaction.create({
      data: {
        type: body?.mode === "sale" ? "Sale" : "Purchase",
        paymentType:
          body?.paymentType === "Cash"
            ? body?.paymentType
            : body?.paymentType?.accountdisplayname,
        date: salePurchase?.createdAt,
        totalAmount: parseFloat(body?.total) || 0,
        amount: parseFloat(body?.paidAmount) || 0,
        balanceDue: parseFloat(body?.balanceDue) || 0,
        transactionId: generateShortSecureID(),
        party: {
          connect: { id: partyId },
        },
        [body?.mode === "sale" ? "sale" : "purchase"]: {
          connect: { id: salePurchase?.id },
        },
        [body?.paymentType === "Cash" ? "cashAdjustment" : "cashAndBank"]: {
          connect: {
            id: body?.paymentType === "Cash" ? cashId : body?.paymentType?.id,
          },
        },
        company: {
          connect: { id: await getCompanyId() },
        },
      },
    });

    // Create party adjustment transaction if needed
    if (body?.partyAmount && body?.partyAmountType && partyId) {
      const amount = parseFloat(body.partyAmount) || 0;
      if (amount > 0) {
        await createPartyAdjustmentTransaction(body, partyId, transaction?.id);
      }
    }

    if (itemIds.length > 0) {
      for (let i = 0; i < itemIds.length; i++) {
        const itemId = itemIds[i];
        await prisma.Transaction.update({
          where: { id: transaction?.id, companyId: await getCompanyId() },
          data: {
            item: {
              connect: { id: itemId },
            },
          },
        });
      }
    }

    return NextResponse.json({
      message: "Transaction created successfully.",
      data: {
        salePurchase,
        partyAdjustment: partyAdjustmentResult,
      },
      status: true,
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: error.message || "Failed to create transaction" },
      { status: 500 }
    );
  }
}
