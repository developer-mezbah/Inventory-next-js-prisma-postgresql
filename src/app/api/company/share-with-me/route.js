import { cookies } from "next/headers";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const email = searchParams.get("email");
    const data = await prisma.userRole.findMany({
      where: { email },
      include: { company: true },
      orderBy: {
        id: "desc",
      },
    });
    return Response.json({ status: true, data });
  } catch (error) {
    return Response.json(
      { error: error.message || "Internal Server Error", status: false },
      { status: 500 }
    );
  }
}

// Connect with company
export async function PUT(request) {
  try {
    const cookieStore = await cookies();
    const body = await request.json();
    const duration = 30 * 24 * 60 * 60; // 30 days in seconds

    const res = await prisma.UserRole.update({
      where: { id: body?.id },
      data: { status: body?.status, userId: body?.userId },
    });

    if (res) {
      cookieStore.set("companyId", res?.companyId, {
        httpOnly: true, // Recommended for security
        secure: process.env.NODE_ENV === "production",
        maxAge: duration,
        path: "/",
      });
    }
    return Response.json({ status: true, data: res });
  } catch (error) {
    console.log(error);

    return Response.json(
      { error: error.message || "Internal Server Error", status: false },
      { status: 500 }
    );
  }
}
