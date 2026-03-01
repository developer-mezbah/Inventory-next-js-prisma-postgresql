import prisma from "@/lib/prisma";
import { generateShortSecureID } from "@/utils/generateShortSecureID";
import { getCompanyId } from "@/utils/GetCompanyId";
import { NextResponse } from "next/server";

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
        // select: { stock: true },
      });

      // Handle potential case where existing item is not found
      if (!existing) {
        // You might want to throw an error or handle this case differently
        console.error(`Item with ID ${item.itemId} not found.`);
        return null; // Return null or another indicator for failure
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
          [body?.mode === "sale" ? "sale" : "purchase"]: {
            connect: { id },
          },
        },
      });

      // This is the ID of the updated item
      return item.itemId;
    } else {
      const createdData = await prisma.item.create({
        data: {
          itemType: "product",
          itemName: item?.item,
          [body?.mode === "sale" ? "salePrice" : "purchasePrice"]: item?.price,
          baseUnit: item?.baseUnit,
          company: {
            connect: { id: await getCompanyId() },
          },
          [body?.mode === "sale" ? "sale" : "purchase"]: {
            connect: { id },
          },
          stock: {

            openingQuantity: body?.mode === "sale" ? 0 : item?.qty,
          },
        },
      });

      // This is the ID of the newly created item
      return createdData?.id;
    }
  });

  // 3. Use Promise.all() to wait for all the promises to resolve.
  // This will return an array containing all the resolved item IDs.
  const itemIds = await Promise.all(itemPromises);

  // Filter out any null values if you chose to return null for missing items
  return itemIds.filter((id) => id !== null);
}

export async function POST(req) {
  try {
    const body = await req.json();

    const newPartyId = await handleParty(body);
    const cashId = await handleCash(body);

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
      partyId: body?.newParty ? newPartyId : body?.selectedParty?.id,
      isPaid: body?.balanceDue === 0 ? true : false,
      balanceDue: body?.balanceDue,
      amount: body?.total,
      paidAmount: body?.paidAmount || 0,
      tax: body?.tax || 0,
      discount: body?.discount || 0,
      description: body?.description,
      billNumber: parseInt(body?.billNumber) || null,
      phoneNumber: parseInt(body?.phoneNumber) || null,
      images: body?.images,
      billDate: body?.billDate || "",
      warranty: body?.warranty || null,
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
      qty: item?.qty,
      unitPrice: item?.price,
      price: item?.amount,
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
        totalAmount: body?.total,
        amount: body?.paidAmount,
        balanceDue: body?.balanceDue || 0,
        transactionId: generateShortSecureID(),
        party: {
          connect: {
            id: body?.newParty ? newPartyId : body?.selectedParty?.id,
          },
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
      data: salePurchase,
      status: true,
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: error || "Failed to fetch Party" },
      { status: 500 }
    );
  }
}
