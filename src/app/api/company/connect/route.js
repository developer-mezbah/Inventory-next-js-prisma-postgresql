import prisma from "@/lib/prisma";
import { cookies } from "next/headers";

export async function GET(request) {
  try {
    const cookieStore = await cookies();
    const duration = 30 * 24 * 60 * 60; // 30 days in seconds
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const companyId = searchParams.get("companyId");
    const company = await prisma.company.findUnique({
      where: { id: companyId, ownerId: userId },
    });
    if (company) {
      cookieStore.set("companyId", company.id, {
        httpOnly: true, // Recommended for security
        secure: process.env.NODE_ENV === "production",
        maxAge: duration,
        path: "/",
      });
    }

    const isActiveShareRole = await prisma.UserRole.findFirst({
      where: {
        userId: userId,
        status: "OPEN",
      },
    });

    if (isActiveShareRole) {
      await prisma.UserRole.update({
        where: { id: isActiveShareRole.id }, // Use the record's ID
        data: { status: "LEAVE" },
      });
    }

    return new Response(JSON.stringify({ status: true }), {
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

export async function DELETE() {
  {
    try {
      const cookieStore = await cookies();
      cookieStore.delete("companyId", { path: "/" });

      return new Response(JSON.stringify({ status: true }), {
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
}
