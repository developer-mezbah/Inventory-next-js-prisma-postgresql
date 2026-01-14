import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";



export async function GET(req, { params }) {
    try {
        const url = new URL(req.url);
        const id = url.searchParams.get('id');
        const type = url.searchParams.get('type');

        const printData = type === "Sale" ? await prisma.Sale.findUnique({
            where: {
                id,
            },
            include: {
                company: true,
                // transaction: true,
                invoiceData: true,
            }
        }): await prisma.Purchase.findUnique({
            where: {
                id,
            },
            include: {
                company: true,
                // transaction: true,
                invoiceData: true,
            }
        });
        return NextResponse.json({ printData, status: true });
    } catch (error) {
        console.log(error);
        return NextResponse.json(
            { error: "Failed to fetch PrintData" },
            { status: 500 }
        );
    }
}