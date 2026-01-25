import prisma from "@/lib/prisma";
import { getCompanyId } from "@/utils/GetCompanyId";
import { NextResponse } from "next/server";

// GET ALL
export async function GET() {
    try {
        const categories = await prisma.category.findMany({
            orderBy: {
                id: 'desc',
            },
            where: {
                companyId: await getCompanyId(),
            },
        });
        const expenceCategory = await prisma.ExpenseCategory.findMany({
            orderBy: {
                id: 'desc',
            },
            where: {
                companyId: await getCompanyId(),
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
        
        return NextResponse.json({ categories,expenceCategory, item: expenseItem, bank, cash });
    } catch (error) {
        console.log(error);
        
        return NextResponse.json({ error: error || "Failed to fetch Init Data" }, { status: 500 });
    }
}