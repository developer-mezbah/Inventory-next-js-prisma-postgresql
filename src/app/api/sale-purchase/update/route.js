import prisma from "@/lib/prisma";
import { generateShortSecureID } from "@/utils/generateShortSecureID";
import { getCompanyId } from "@/utils/GetCompanyId";
import { NextResponse } from "next/server";

async function reversePreviousTransactions(existingRecord, companyId, mode) {
    try {
        // 1. Reverse cash/bank adjustment
        if (existingRecord.paymentType === "Cash") {
            await prisma.CashAdjustment.updateMany({
                where: {
                    companyId: companyId,
                    transaction: {
                        some: mode === "sale" ? { saleId: existingRecord.id } : { purchaseId: existingRecord.id }
                    }
                },
                data: {
                    cashInHand: {
                        [mode === "sale" ? "decrement" : "increment"]: existingRecord.paidAmount
                    }
                }
            });
        } else if (existingRecord.paymentTypeId) {
            await prisma.CashAndBank.update({
                where: {
                    id: existingRecord.paymentTypeId,
                    companyId: companyId,
                },
                data: {
                    openingbalance: {
                        [mode === "sale" ? "decrement" : "increment"]: existingRecord.paidAmount
                    }
                }
            });
        }

        // 2. Restore stock quantities for all items
        for (const invoiceData of existingRecord.invoiceData) {
            if (invoiceData.itemId) {
                const oldQty = parseFloat(invoiceData.qty) || 0;
                const item = await prisma.Item.findFirst({
                    where: {
                        AND: [
                            { id: invoiceData.itemId },
                            { companyId }
                        ]
                    }
                });

                // For sale: restore stock (add back)
                // For purchase: reduce stock (remove what was added)
                const stockChange = mode === "sale" ? oldQty : -oldQty;

                await prisma.Item.update({
                    where: {
                        id: item.id
                    },
                    data: {
                        stock: {
                            ...item.stock,
                            openingQuantity: mode === "sale" ? item?.stock?.openingQuantity || 0 + stockChange : item?.stock?.openingQuantity - oldQty,
                        }
                    }
                });
            }
        }

        // 3. Delete old transaction
        if (existingRecord.transaction && existingRecord.transaction.length > 0) {
            const transactionIds = existingRecord.transaction.map(item => item.id);
            await prisma.Transaction.deleteMany({
                where: {
                    id: {
                        in: transactionIds,
                    },
                },
            });
        }

        // 4. Disconnect items from sale/purchase
        const relationField = mode === "sale" ? "saleId" : "purchaseId";
        if (existingRecord.items && existingRecord.items.length > 0) {
            await prisma.Item.updateMany({
                where: {
                    id: { in: existingRecord.items.map(item => item.id) },
                    companyId: companyId
                },
                data: {
                    [relationField]: null
                }
            });
        }

    } catch (error) {
        console.error("Error reversing previous transactions:", error);
        throw error;
    }
}

export async function PUT(req) {
    try {
        const body = await req.json();
        const mode = body?.mode || "sale"; // Default to sale if not specified

        if (!body.id) {
            return NextResponse.json({
                error: `${mode === "sale" ? "Sale" : "Purchase"} ID is required for update`,
                status: false
            }, { status: 400 });
        }

        const recordId = body.id;
        const companyId = await getCompanyId();
        const userId = body.userId;

        // 1. Fetch existing record with related data
        const model = mode === "sale" ? prisma.Sale : prisma.Purchase;
        const existingRecord = await model.findUnique({
            where: {
                id: recordId,
                companyId: companyId
            },
            include: {
                items: true,
                invoiceData: true,
                transaction: {
                    include: {
                        cashAdjustment: true,
                        cashAndBank: true
                    }
                }
            }
        });

        if (!existingRecord) {
            return NextResponse.json({
                error: `${mode === "sale" ? "Sale" : "Purchase"} not found`,
                status: false
            }, { status: 404 });
        }

        // 2. Reverse previous transactions and stock adjustments
        await reversePreviousTransactions(existingRecord, companyId, mode);

        // 3. Handle party (use existing if no change)
        let partyId = existingRecord.partyId;
        let partyName = existingRecord.partyName;

        if (body.newParty) {
            const newParty = await prisma.Party.create({
                data: {
                    phoneNumber: body?.phoneNumber.toString() || "",
                    partyName: body?.newParty || "",
                    companyId: companyId,
                    // userId: userId
                },
            });
            partyId = newParty.id;
            partyName = body.newParty;
        } else if (body.selectedParty?.id) {
            partyId = body.selectedParty.id;
            partyName = body.selectedParty.partyName;
        }

        // 4. Handle cash/bank adjustment
        let paymentTypeId = null;
        let paymentTypeName = "";

        if (body.paymentType === "Cash") {
            paymentTypeName = "Cash";

            const cashAdj = await prisma.CashAdjustment.upsert({
                where: {
                    userId: userId,
                    companyId: companyId
                },
                update: {
                    cashInHand: {
                        [mode === "sale" ? "increment" : "decrement"]: body.paidAmount
                    }
                },
                create: {
                    userId: userId,
                    companyId: companyId,
                    cashInHand: mode === "sale" ? body.paidAmount : -body.paidAmount
                }
            });

            paymentTypeId = cashAdj.id;

        } else if (body.paymentType?.id && body.paymentType?.accountdisplayname) {
            paymentTypeName = body.paymentType.accountdisplayname;
            paymentTypeId = body.paymentType.id;

            await prisma.CashAndBank.update({
                where: {
                    id: paymentTypeId,
                    companyId: companyId,
                },
                data: {
                    openingbalance: {
                        [mode === "sale" ? "increment" : "decrement"]: body.paidAmount
                    }
                }
            });
        }

        // 5. Update the sale/purchase record
        const updateData = {
            balanceDue: parseFloat(body.balanceDue) || 0,
            paymentType: paymentTypeName,
            paymentTypeId: paymentTypeId,
            partyName: partyName,
            partyId: partyId,
            isPaid: parseFloat(body.balanceDue) === 0,
            amount: parseFloat(body.total) || 0,
            paidAmount: parseFloat(body.paidAmount) || 0,
            tax: parseFloat(body.tax) || 0,
            discount: parseFloat(body.discount) || 0,
            description: body.description || "",
            billNumber: parseInt(body.billNumber) || null,
            phoneNumber: parseInt(body.phoneNumber) || null,
            images: body.images || [],
            billDate: body.billDate || null,
            warranty: body.warranty || null,
            updatedAt: new Date()
        };

        const updatedRecord = await model.update({
            where: {
                id: recordId,
                companyId: companyId
            },
            data: updateData
        });

        // 6. Handle items update
        const itemIds = [];
        const relationField = mode === "sale" ? "saleId" : "purchaseId";
        const priceField = mode === "sale" ? "salePrice" : "purchasePrice";

        if (body.items && Array.isArray(body.items)) {
            // First, disconnect all existing items from this record
            await prisma.Item.updateMany({
                where: {
                    [relationField]: recordId,
                    companyId: companyId
                },
                data: {
                    [relationField]: null
                }
            });

            // Process each item
            for (const item of body.items) {
                let itemId;

                if (item.itemId) {
                    // Update existing item
                    const existingItem = await prisma.Item.findUnique({
                        where: {
                            id: item.itemId,
                            companyId: companyId
                        },
                        // include: { stock: true }
                    });

                    if (existingItem) {
                        // Restore previous stock (from old record data)
                        const oldInvoiceData = existingRecord.invoiceData.find(inv => inv.itemId === item.itemId);
                        if (oldInvoiceData) {
                            const oldQty = parseFloat(oldInvoiceData.qty) || 0;
                            const currentStock = existingItem.stock?.openingQuantity || 0;
                            // For sale: add back old quantity (since we're restoring)
                            // For purchase: subtract old quantity (since we're restoring)
                            const stockChange = mode === "sale" ? oldQty : -oldQty;

                            await prisma.Item.update({
                                where: {
                                    id: oldInvoiceData?.itemId,
                                    companyId: companyId
                                },
                                data: {
                                    stock: {
                                        openingQuantity: currentStock + stockChange
                                    },
                                }
                            });
                        }

                        // Adjust stock with new quantity
                        const newQty = parseFloat(item.qty) || 0;
                        // For sale: reduce stock
                        // For purchase: increase stock
                        const stockAdjustment = mode === "sale" ? -newQty : newQty;
                        const currentStockAfterRestore = existingItem.stock?.openingQuantity || 0;

                        await prisma.Item.update({
                            where: {
                                id: item.itemId,
                                companyId: companyId,
                            },
                            data: {
                                [priceField]: parseFloat(item.price) || 0,
                                [mode]: {
                                    connect: { id: recordId }
                                },
                                stock: {
                                    openingQuantity: currentStockAfterRestore + stockAdjustment
                                },
                            }
                        });

                        itemId = item.itemId;
                    }
                } else {
                    // Create new item
                    const itemData = {
                        itemType: "product",
                        itemName: item.item,
                        [priceField]: parseFloat(item.price) || 0,
                        baseUnit: item.unit || item.baseUnit,
                        companyId: companyId,
                        userId: userId,
                        [mode]: {
                            connect: { id: recordId }
                        },
                        stock: {
                            create: {
                                openingQuantity: parseFloat(item.qty) || 0,
                                companyId: companyId,
                                userId: userId
                            }
                        }
                    };

                    const createdItem = await prisma.Item.create({
                        data: itemData
                    });
                    itemId = createdItem.id;
                }

                if (itemId) itemIds.push(itemId);
            }
        }

        // 7. Update invoice data
        const invoiceRelationField = mode === "sale" ? "saleId" : "purchaseId";

        await prisma.InvoiceData.deleteMany({
            where: {
                [invoiceRelationField]: recordId,
            }
        });

        if (body.items && body.items.length > 0) {
            await prisma.InvoiceData.createMany({
                data: body.items.map((item) => ({
                    itemName: item.item,
                    itemId: item.itemId,
                    qty: parseFloat(item.qty) || 0,
                    unitPrice: parseFloat(item.price) || 0,
                    price: parseFloat(item.amount) || 0,
                    [invoiceRelationField]: recordId,
                }))
            });
        }

        // 8. Create new transaction
        const transactionData = {
            type: mode === "sale" ? "Sale" : "Purchase",
            paymentType: paymentTypeName,
            date: new Date(),
            totalAmount: parseFloat(body.total) || 0,
            amount: parseFloat(body.paidAmount) || 0,
            balanceDue: parseFloat(body.balanceDue) || 0,
            transactionId: generateShortSecureID(),
            partyId: partyId,
            companyId: companyId,
            ...(body.paymentType === "Cash"
                ? { cashAdjustmentId: paymentTypeId }
                : { cashAndBankId: paymentTypeId }
            )
        };

        // Add saleId or purchaseId based on mode
        if (mode === "sale") {
            transactionData.saleId = recordId;
        } else {
            transactionData.purchaseId = recordId;
        }

        const transaction = await prisma.Transaction.create({
            data: transactionData
        });

        // 9. Connect items to transaction
        if (itemIds.length > 0) {
            await Promise.all(itemIds.map(async (id) => {
                await prisma.Transaction.update({
                    where: {
                        id: transaction.id,
                        companyId: companyId
                    },
                    data: {
                        item: {
                            connect: { id }
                        }
                    }
                });
            }));
        }

        return NextResponse.json({
            message: `${mode === "sale" ? "Sale" : "Purchase"} updated successfully.`,
            data: updatedRecord,
            transactionId: transaction.id,
            status: true
        });

    } catch (error) {
        console.error("Update error:", error);
        console.log(error)
        return NextResponse.json({
            error: error.message || `Failed to update ${body?.mode === "sale" ? "Sale" : "Purchase"}`,
            details: error
        }, { status: 500 });
    }
}