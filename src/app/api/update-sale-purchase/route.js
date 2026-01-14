import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    const type = url.searchParams.get("type");
    const partyId = url.searchParams.get("partyId");
    console.log({ id, type });

    const party = await prisma.Party.findUnique({
      where: {
        id: partyId,
      },
    });
    const invoiceData = await prisma.InvoiceData.findMany({
      where: {
        [type === "sale" ? "saleId" : "purchaseId"]: id,
      },
    });

    const data =
      type === "sale"
        ? await prisma.Sale.findUnique({
            where: {
              id,
            },
            include: {
              transaction: true,
              items: true,
            },
          })
        : await prisma.Purchase.findUnique({
            where: {
              id,
            },
            include: {
              transaction: true,
              items: true,
            },
          });

    return NextResponse.json({ data, party, invoiceData, status: true });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Failed to fetch PrintData" },
      { status: 500 }
    );
  }
}
