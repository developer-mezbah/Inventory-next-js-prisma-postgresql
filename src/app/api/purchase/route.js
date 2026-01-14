import prisma from "@/lib/prisma";
import { generateShortSecureID } from "@/utils/generateShortSecureID";
import { getCompanyId } from "@/utils/GetCompanyId";
import { NextResponse } from "next/server";


export async function GET(req) {
    try {
        const purchases = await prisma.Purchase.findMany({
            where: { companyId: await getCompanyId() },
            orderBy: { createdAt: "desc" },
            include: {
                transaction: true,
            },
        });
        return NextResponse.json({ data: purchases, status: true });
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: error || "Failed to fetch Purchases" }, { status: 500 });
    }
}

async function handleParty(body) {
    if (body?.newParty) {
        const newParty = await prisma.Party.create({
            data: { phoneNumber: body?.phoneNumber, partyName: body?.newParty, companyId: await getCompanyId(), },
        });
        return newParty?.id
    }

}
async function handleCash(body) {
    if (body?.paymentType === "Cash") {
        await prisma.CashAdjustment.findUnique({
            where: {
                userId: body?.userId,
                companyId: await getCompanyId(),
            },
        });
        const res = await prisma.CashAdjustment.update({
            where: {
                userId: body?.userId,
                companyId: await getCompanyId(),
            },
            data: {
                cashInHand: { decrement: body?.paidAmount }
            }
        })
        return res?.id
    } else {
        await prisma.CashAndBank.update({
            where: {
                id: body?.paymentType?.id,
                companyId: await getCompanyId(),
            },
            data: {
                openingbalance: { decrement: body?.paidAmount }
            }
        })
    }

}

async function handleItem(body) {
    // 1. Check if body or items is null/undefined
    if (!body?.items) {
        return [];
    }

    // 2. Use map to create an array of promises.
    // Each promise resolves to an Item ID (either existing or new).
    const itemPromises = body.items.map(async (item) => {
        if (item?.itemId) {
            const existing = await prisma.Item.findUnique({
                where: { id: item?.itemId, companyId: await getCompanyId(), },
                // select: { stock: true }
            });

            // Handle potential case where existing item is not found
            if (!existing) {
                // You might want to throw an error or handle this case differently
                console.error(`Item with ID ${item.itemId} not found.`);
                return null; // Return null or another indicator for failure
            }

            const currentQty = existing?.stock?.openingQuantity || 0;
            const addedQty = parseFloat(item?.qty) || 0;
            const newOpeningQty = currentQty + addedQty;

            await prisma.item.update({
                where: {
                    id: item?.itemId,
                    companyId: await getCompanyId(),
                },
                data: {
                    purchasePrice: item?.price,
                    stock: {
                        ...existing?.stock,
                        openingQuantity: newOpeningQty
                    }
                }
            });

            // This is the ID of the updated item
            return item.itemId;

        } else {
            const createdData = await prisma.item.create({
                data: {
                    itemType: "product",
                    itemName: item?.item,
                    purchasePrice: item?.price,
                    baseUnit: item?.baseUnit,
                    company: {
                        connect: { id: await getCompanyId() }
                    },
                    stock: {
                        openingQuantity: item?.qty,
                    }
                }
            });

            // This is the ID of the newly created item
            return createdData?.id;
        }
    });

    // 3. Use Promise.all() to wait for all the promises to resolve.
    // This will return an array containing all the resolved item IDs.
    const itemIds = await Promise.all(itemPromises);

    // Filter out any null values if you chose to return null for missing items
    return itemIds.filter(id => id !== null);
}

export async function POST(req) {
    try {
        const body = await req.json();

        const newPartyId = await handleParty(body)
        const cashId = await handleCash(body)
        const itemIds = await handleItem(body)


        const purchaseCreated = await prisma.Purchase.create({
            data: {
                balanceDue: body?.balanceDue || 0,
                paymentType: body?.paymentType === "Cash" ? body?.paymentType : body?.paymentType?.accountdisplayname,
                partyName: body?.newParty ? body?.newParty : body?.selectedParty?.partyName,
                isPaid: body?.balanceDue === 0 ? true : false,
                amount: body?.total,
                paidAmount: body?.paidAmount || 0,
                tax: body?.tax || 0,
                discount: body?.discount || 0,
                description: body?.description,
                billNumber: body?.billNumber || null,
                phoneNumber: parseInt(body?.phoneNumber) || null,
                images: body?.images,
                billDate: body?.billDate || "",
                company: {
                    connect: { id: await getCompanyId() }
                }
            }
        })
        await prisma.Transaction.create({
            data: {
                type: "Purchase", paymentType: body?.paymentType === "Cash" ? body?.paymentType : body?.paymentType?.accountdisplayname, date: purchaseCreated?.createdAt, totalAmount: body?.total, amount: body?.paidAmount, balanceDue: body?.balanceDue || 0, transactionId: generateShortSecureID(),
                party: {
                    connect: { id: body?.newParty ? newPartyId : body?.selectedParty?.id }
                },
                purchase: {
                    connect: { id: purchaseCreated?.id }
                },
                [body?.paymentType === "Cash" ? "cashAdjustment" : "cashAndBank"]: {
                    connect: { id: body?.paymentType === "Cash" ? cashId : body?.paymentType?.id }
                },
                company: {
                    connect: { id: await getCompanyId() }
                }
            },
        });

        await prisma.InvoiceData.createMany({
            data: body?.items.map((item) => ({
                itemName: item?.item,
                qty: item?.qty,
                unitPrice: item?.price,
                price: item?.amount,
                purchaseId: purchaseCreated?.id
            })),
        });


        if (itemIds.length > 0) {
            for (let i = 0; i < itemIds.length; i++) {
                const itemId = itemIds[i];
                await prisma.Transaction.update({
                    where: { id: transaction?.id, companyId: await getCompanyId(), },
                    data: {
                        item: {
                            connect: { id: itemId }
                        }
                    }
                });
            }
        }
        return NextResponse.json({
            message: "Purchase and Transaction created successfully.",
            data: purchaseCreated,
            status: true
        });
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: error || "Failed to fetch Party" }, { status: 500 });
    }
}