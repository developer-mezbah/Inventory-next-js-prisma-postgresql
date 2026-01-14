import prisma from "@/lib/prisma";
import { getCompanyId } from "@/utils/GetCompanyId";

export async function GET(request) {
  try {
    const companyId = await getCompanyId();
    const currency = await prisma.Currency.findFirst({
      where: { companyId: companyId },
    });
    console.log(currency);

    return new Response(JSON.stringify(currency), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("API Error in /api/company:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
