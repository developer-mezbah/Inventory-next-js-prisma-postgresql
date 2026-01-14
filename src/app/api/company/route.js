import prisma from "@/lib/prisma";
import { getCompanyId } from "@/utils/GetCompanyId";

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, userId } = body;

    if (!name) {
      return new Response(
        JSON.stringify({ error: "Company name is required." }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const newCompany = await prisma.company.create({
      data: {
        name: name,
        ownerId: userId,
        // Add any other required fields here
      },
    });
    return new Response(JSON.stringify(newCompany), {
      status: 201, // Created
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

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const companyId = await getCompanyId();
    const companies = await prisma.company.findMany({
      where: { ownerId: userId },
    });
    return new Response(
      JSON.stringify(
        companies.map((item) => ({
          ...item,
          active: item?.id == companyId ? true : false,
        }))
      ),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("API Error in /api/company:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
