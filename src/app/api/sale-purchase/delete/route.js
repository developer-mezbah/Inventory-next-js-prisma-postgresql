import prisma from "@/lib/prisma";
import { getCompanyId } from "@/utils/GetCompanyId";
import { NextResponse } from "next/server";

async function reverseTransactionsForDelete(record, companyId, mode) {
  try {
    // 1. Reverse cash/bank adjustment
    if (record.paymentType === "Cash") {
      await prisma.CashAdjustment.updateMany({
        where: {
          companyId: companyId,
          transaction: {
            some:
              mode === "sale"
                ? { saleId: record.id }
                : { purchaseId: record.id },
          },
        },
        data: {
          cashInHand: {
            [mode === "sale" ? "decrement" : "increment"]: record.paidAmount,
          },
        },
      });
    } else if (record.paymentTypeId) {
      await prisma.CashAndBank.update({
        where: {
          id: record.paymentTypeId,
          companyId: companyId,
        },
        data: {
          openingbalance: {
            [mode === "sale" ? "decrement" : "increment"]: record.paidAmount,
          },
        },
      });
    }

    // 2. Restore stock quantities for all items
    if (record.invoiceData && Array.isArray(record.invoiceData)) {
      for (const invoiceData of record.invoiceData) {
        if (invoiceData.itemId) {
          const oldQty = parseFloat(invoiceData.qty) || 0;

          // Find the item
          const item = await prisma.Item.findUnique({
            where: {
              id: invoiceData.itemId,
              companyId: companyId,
            },
            // include: { stock: true },
          });

          if (item) {
            // For sale: restore stock (add back what was sold)
            // For purchase: reduce stock (remove what was purchased)
            const stockChange = mode === "sale" ? oldQty : -oldQty;
            const currentStock = item.stock?.openingQuantity || 0;

            await prisma.Item.update({
              where: {
                id: invoiceData.itemId,
                companyId: companyId,
              },
              data: {
                stock: {
                  ...item.stock,
                  openingQuantity: currentStock + stockChange,
                },
              },
            });
          }
        }
      }
    }

    // 3. Disconnect items from sale/purchase
    const relationField = mode === "sale" ? "saleId" : "purchaseId";
    if (record.items && record.items.length > 0) {
      await prisma.Item.updateMany({
        where: {
          id: { in: record.items.map((item) => item.id) },
          companyId: companyId,
        },
        data: {
          [relationField]: null,
        },
      });
    }

    // 4. Delete related transactions
    if (record.transaction && record.transaction.length > 0) {
      const transactionIds = record.transaction.map((t) => t.id);
      await prisma.Transaction.deleteMany({
        where: {
          id: {
            in: transactionIds,
          },
          companyId: companyId,
        },
      });
    }

    // 5. Delete invoice data
    const invoiceRelationField = mode === "sale" ? "saleId" : "purchaseId";
    await prisma.InvoiceData.deleteMany({
      where: {
        [invoiceRelationField]: record.id,
      },
    });

    return true;
  } catch (error) {
    console.log(error);
    console.error("Error reversing transactions for delete:", error);
    throw error;
  }
}

export async function DELETE(req) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    const mode = url.searchParams.get("mode") || "sale"; // Default to sale if not specified
    console.log({ id, mode });

    if (!id) {
      return NextResponse.json(
        {
          error: `${mode === "sale" ? "Sale" : "Purchase"} ID is required`,
          status: false,
        },
        { status: 400 }
      );
    }

    const companyId = await getCompanyId();

    // 1. Fetch the record with all related data
    const model = mode === "sale" ? prisma.Sale : prisma.Purchase;
    const record = await model.findUnique({
      where: {
        id: id,
        companyId: companyId,
      },
      include: {
        items: {
          select: {
            id: true,
          },
        },
        invoiceData: true,
        transaction: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!record) {
      return NextResponse.json(
        {
          error: `${mode === "sale" ? "Sale" : "Purchase"} not found`,
          status: false,
        },
        { status: 404 }
      );
    }

    // 2. Reverse all transactions (cash/bank adjustments, stock, etc.)
    await reverseTransactionsForDelete(record, companyId, mode);

    // 3. Delete the main record
    await model.delete({
      where: {
        id: id,
        companyId: companyId,
      },
    });

    return NextResponse.json({
      message: `${mode === "sale" ? "Sale" : "Purchase"} deleted successfully`,
      status: true,
    });
  } catch (error) {
    console.log("Delete error:", error);
    console.error("Delete error:", error);
    return NextResponse.json(
      {
        error:
          error.message ||
          `Failed to delete ${mode === "sale" ? "sale" : "purchase"}`,
        details: error,
      },
      { status: 500 }
    );
  }
}
