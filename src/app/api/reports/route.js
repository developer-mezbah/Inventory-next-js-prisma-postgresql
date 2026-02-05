import prisma from "@/lib/prisma";
import { getCompanyId } from "@/utils/GetCompanyId";
import { NextResponse } from "next/server";

// GET ALL
export async function GET(request) {
  try {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get('id');
  console.log("ID:", id);
  if (!id) {
    return NextResponse.json({ error: "ID parameter is required" }, { status: 400 });
  }
  if (id === "sales") {
    const companyId = await getCompanyId();
    const salesReports = await prisma.sale.findMany({
        where: { companyId: companyId },
        include: {
          transaction: true,
        },
    });
    return NextResponse.json(salesReports);
  }
    return NextResponse.json({});
  } catch (error) {
    return NextResponse.json({ error: error || "Failed to fetch Data!" }, { status: 500 });
  }
}