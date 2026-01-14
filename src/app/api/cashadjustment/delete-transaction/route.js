import prisma from "@/lib/prisma";
import { getCompanyId } from "@/utils/GetCompanyId";
import { NextResponse } from "next/server";

export async function DELETE(req) {
    try {
        const url = new URL(req.url);
        const id = url.searchParams.get('id');
        const userId = url.searchParams.get('userId');
        const transaction = await prisma.Transaction.findUnique({
            where: { id, companyId: await getCompanyId() }
        })

        if (transaction) {
            await prisma.CashAdjustment.update({
                where: {
                    userId, companyId: await getCompanyId()
                },
                data: {
                    cashInHand: transaction?.type === "Add Cash" ? { decrement: transaction?.amount } : { increment: transaction?.amount }
                }
            })
            await prisma.Transaction.delete({
                where: { id, companyId: await getCompanyId() },
            });
        }
        return NextResponse.json({ message: "CashAdjustment deleted successfully", status: true });
    } catch (error) {
        console.log(error);

        return NextResponse.json({ error: error || "Failed to delete CashAdjustment" }, { status: 500 });
    }
}
