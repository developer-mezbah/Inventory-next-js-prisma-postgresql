import prisma from "@/lib/prisma";
import { getCompanyId } from "@/utils/GetCompanyId";
import { NextResponse } from "next/server";

// GET ALL
export async function GET(request) {
  try {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get('id');
    const companyId = await getCompanyId();
  if (!id) {
    return NextResponse.json({ error: "ID parameter is required" }, { status: 400 });
  }
  if (id === "sales") {
    const salesReports = await prisma.sale.findMany({
        where: { companyId: companyId },
        include: {
          transaction: true,
        },
    });
    return NextResponse.json(salesReports);
  }
  if (id === "transactions") {
    const transactions = await prisma.Transaction.findMany({
        where: { companyId: companyId },
    });
    return NextResponse.json(transactions);
  }
    return NextResponse.json({});
  } catch (error) {
    return NextResponse.json({ error: error || "Failed to fetch Data!" }, { status: 500 });
  }
}