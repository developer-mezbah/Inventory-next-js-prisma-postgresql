import prisma from "@/lib/prisma";
import { generateShortSecureID } from "@/utils/generateShortSecureID";
import { getCompanyId } from "@/utils/GetCompanyId";
import { NextResponse } from "next/server";

async function reversePreviousTransactions(existingSale, companyId) {
    try {
        // 1. Reverse cash/bank adjustment
        // Reduce money to add new items money
        if (existingSale.paymentType === "Cash") {
            await prisma.CashAdjustment.updateMany({
                where: {
                    companyId: companyId,
                    transaction: {
                        some: { saleId: existingSale.id }
                    }
                },
                data: {
                    cashInHand: { decrement: existingSale.paidAmount }
                }
            });
        } else if (existingSale.paymentTypeId) {
            await prisma.CashAndBank.update({
                where: {
                    id: existingSale.paymentTypeId,
                    companyId: companyId,
                },
                data: {
                    openingbalance: { decrement: existingSale.paidAmount }
                }
            });
        }

        // 2. Restore stock quantities for all items
        for (const invoiceData of existingSale.invoiceData) {
            if (invoiceData.itemId) {
                const oldQty = parseFloat(invoiceData.qty) || 0;
                const item = await prisma.Item.findFirst({
                    where: {
                        AND: [
                            { id: invoiceData.itemId },
                            { companyId }
                        ]
                    }
                })
                await prisma.Item.update({
                    where: {
                        id: item.id
                    },
                    data: {
                        stock: {
                            ...item.stock,
                            openingQuantity: item.stock.openingQuantity + oldQty,
                        }
                    }
                })

            }
        }
        // Assuming 'prisma' and 'companyId' are defined in the scope


        // 3. Delete old transaction
        if (existingSale.transaction && existingSale.transaction.length > 0) {
            // 1. Check if the array exists AND has elements.
            const transactionIds = existingSale.transaction.map(item => item.id);

            // 2. Use the 'in' operator for deleting multiple records by ID array.
            await prisma.Transaction.deleteMany({
                where: {
                    id: {
                        in: transactionIds,
                    },
                },
            });
        }

        // 4. Disconnect items from sale
        if (existingSale.items && existingSale.items.length > 0) {
            await prisma.Item.updateMany({
                where: {
                    id: { in: existingSale.items.map(item => item.id) },
                    companyId: companyId
                },
                data: {
                    saleId: null
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

        if (!body.id) {
            return NextResponse.json({
                error: "Sale ID is required for update",
                status: false
            }, { status: 400 });
        }

        const saleId = body.id;
        const companyId = await getCompanyId();
        const userId = body.userId; // From your body data

        // 1. Fetch existing sale with related data
        const existingSale = await prisma.Sale.findUnique({
            where: {
                id: saleId,
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

        if (!existingSale) {
            return NextResponse.json({
                error: "Sale not found",
                status: false
            }, { status: 404 });
        }

        // 2. Reverse previous transactions and stock adjustments
        await reversePreviousTransactions(existingSale, companyId);

        // 3. Handle party (use existing if no change)
        let partyId = existingSale.partyId;
        let partyName = existingSale.partyName;

        if (body.newParty) {
            // Create new party
            const newParty = await prisma.Party.create({
                data: {
                    phoneNumber: body?.phoneNumber,
                    partyName: body?.newParty,
                    companyId: companyId,
                    userId: userId
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

            // Update or create cash adjustment
            const cashAdj = await prisma.CashAdjustment.upsert({
                where: {
                    userId: userId,
                    companyId: companyId
                },
                update: {
                    cashInHand: {
                        increment: body.paidAmount
                    }
                },
                create: {
                    userId: userId,
                    companyId: companyId,
                    cashInHand: body.paidAmount
                }
            });

            paymentTypeId = cashAdj.id;

        } else if (body.paymentType?.id && body.paymentType?.accountdisplayname) {
            paymentTypeName = body.paymentType.accountdisplayname;
            paymentTypeId = body.paymentType.id;

            // Update cash and bank
            await prisma.CashAndBank.update({
                where: {
                    id: paymentTypeId,
                    companyId: companyId,
                },
                data: {
                    openingbalance: { increment: body.paidAmount }
                }
            });
        }

        // 5. Update the sale record
        const updatedSale = await prisma.Sale.update({
            where: {
                id: saleId,
                companyId: companyId
            },
            data: {
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
                updatedAt: new Date()
            }
        });

        // 6. Handle items update
        const itemIds = [];
        if (body.items && Array.isArray(body.items)) {
            // First, disconnect all existing items from this sale
            await prisma.item.updateMany({
                where: {
                    saleId: saleId, // Find Items with this saleId
                    companyId: companyId
                },
                data: {
                    saleId: null // Set the foreign key to null to disconnect
                }
            });

            // Process each item
            for (const item of body.items) {
                let itemId;

                if (item.id) {
                    // Update existing item
                    const existingItem = await prisma.Item.findUnique({
                        where: {
                            id: item.itemId,
                            companyId: companyId
                        },
                        include: { stock: true }
                    });

                    if (existingItem) {
                        // Restore previous stock (from old sale data)
                        const oldInvoiceData = existingSale.invoiceData.find(inv => inv.itemId === item.id);
                        if (oldInvoiceData) {
                            const oldQty = parseFloat(oldInvoiceData.qty) || 0;
                            const currentStock = existingItem.stock?.openingQuantity || 0;
                            await prisma.Item.update({
                                where: {
                                    id: oldInvoiceData?.itemId,
                                    companyId: companyId
                                },
                                data: {
                                    stock: {
                                        set: {
                                            openingQuantity: currentStock + oldQty
                                        }
                                    },
                                }
                            });
                        }


                        // Reduce stock with new quantity
                        const newQty = parseFloat(item.qty) || 0;
                        // Update item details
                        await prisma.Item.update({
                            where: {
                                id: item.itemId,
                                companyId: companyId,
                            },
                            data: {
                                salePrice: parseFloat(item.price) || 0,
                                sale: {
                                    connect: { id: saleId }
                                },
                                stock: {
                                    set: {
                                        openingQuantity: existingItem?.stock?.openingQuantity - newQty
                                    }
                                },
                            }
                        });

                        itemId = item.itemId;
                    }
                } else {
                    // Create new item
                    const createdItem = await prisma.Item.create({
                        data: {
                            itemType: "product",
                            itemName: item.item,
                            salePrice: parseFloat(item.price) || 0,
                            baseUnit: item.unit,
                            companyId: companyId,
                            userId: userId,
                            sale: {
                                connect: { id: saleId }
                            },
                            stock: {
                                create: {
                                    openingQuantity: parseFloat(item.qty) || 0,
                                    companyId: companyId,
                                    userId: userId
                                }
                            }
                        }
                    });
                    itemId = createdItem.id;
                }

                if (itemId) itemIds.push(itemId);
            }
        }

        // 7. Update invoice data
        // Delete old invoice data
        await prisma.InvoiceData.deleteMany({
            where: {
                saleId: saleId,
            }
        });

        // Create new invoice data
        if (body.items && body.items.length > 0) {
            await prisma.InvoiceData.createMany({
                data: body.items.map((item) => ({
                    itemName: item.item,
                    itemId: item.itemId,
                    qty: parseFloat(item.qty) || 0,
                    unitPrice: parseFloat(item.price) || 0,
                    price: parseFloat(item.amount) || 0,
                    saleId: saleId,
                }))
            });
        }

        // 8. Create new transaction
        const transaction = await prisma.Transaction.create({
            data: {
                type: "Sale",
                paymentType: paymentTypeName,
                date: new Date(),
                totalAmount: parseFloat(body.total) || 0,
                amount: parseFloat(body.paidAmount) || 0,
                balanceDue: parseFloat(body.balanceDue) || 0,
                transactionId: generateShortSecureID(),
                partyId: partyId,
                saleId: saleId,
                companyId: companyId,
                ...(body.paymentType === "Cash"
                    ? { cashAdjustmentId: paymentTypeId }
                    : { cashAndBankId: paymentTypeId }
                )
            }
        });

        // 9. Connect items to transaction
        if (itemIds.length > 0) {
            itemIds.map(async (id) => (
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
                })
            ))

        }

        return NextResponse.json({
            message: "Sale updated successfully.",
            data: updatedSale,
            transactionId: transaction.id,
            status: true
        });

    } catch (error) {
        console.error("Update error:", error);
        return NextResponse.json({
            error: error.message || "Failed to update Sale",
            details: error
        }, { status: 500 });
    }
}