import prisma from "@/lib/prisma";
import { getCompanyId } from "@/utils/GetCompanyId";
import { NextResponse } from "next/server";
import { initializeGlobalDefaultCategories } from "../category/route";

// GET ALL
export async function GET() {
    try {

        // Initialize global default categories (run once if needed)
        await initializeGlobalDefaultCategories();
        const expenceCategory = await prisma.ExpenseCategory.findMany({
            orderBy: {
                id: 'desc',
            },
            where: {
                OR: [
                    { companyId: null },           // Global default categories
                    { companyId: await getCompanyId() },      // Company-specific categories
                ]
            },
        });
        const expenseItem = await prisma.ExpenseItem.findMany({
            orderBy: {
                id: 'desc',
            },
            where: {
                companyId: await getCompanyId(),
            },
        });
        const bank = await prisma.CashAndBank.findMany({
            orderBy: {
                id: 'desc',
            },
            where: {
                companyId: await getCompanyId(),
            },
        });
        const cash = await prisma.CashAdjustment.findMany({
            orderBy: {
                id: 'desc',
            },
            where: {
                companyId: await getCompanyId(),
            },
        });

        return NextResponse.json({ expenceCategory, item: expenseItem, bank, cash });
    } catch (error) {
        console.log(error);

        return NextResponse.json({ error: error || "Failed to fetch Init Data" }, { status: 500 });
    }
}