import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getCompanyId } from "@/utils/GetCompanyId";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

// Update your PUT and GET endpoints to include country fields
export async function PUT(req, { params }) {
  try {
    const body = await req.json();
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;
    const whereCondition = { id: await getCompanyId() };

    // Extract all fields
    const { currencyCode, currencySymbol, country, countryCode, ...otherData } =
      body;

    // Prepare update object
    const updateData = {
      ...otherData,
      ownerId: userId,
    };

    // Add currency fields if provided
    if (currencyCode !== undefined) updateData.currencyCode = currencyCode;
    if (currencySymbol !== undefined)
      updateData.currencySymbol = currencySymbol;
    if (country !== undefined) updateData.country = country;
    if (countryCode !== undefined) updateData.countryCode = countryCode;

    // Set defaults if not provided during create
    if (!whereCondition.id) {
      if (!currencyCode) updateData.currencyCode = "USD";
      if (!currencySymbol) updateData.currencySymbol = "$";
    }

    const result = await prisma.Company.upsert({
      where: whereCondition,
      update: updateData,
      create: updateData,
    });

    return NextResponse.json({ result, status: true });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Failed to upsert Company" },
      { status: 500 }
    );
  }
}

export async function GET(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;
    const companyId = await getCompanyId();

    const company = await prisma.Company.findUnique({
      where: {
        id: companyId,
        ownerId: userId,
      },
      select: {
        id: true,
        name: true,
        phoneNumber: true,
        emailId: true,
        businessType: true,
        businessCategory: true,
        businessAddress: true,
        websiteUrl: true,
        signatureUrl: true,
        logoUrl: true,
        code: true,
        symbol: true,
        currencyCode: true,
        currencySymbol: true,
        country: true,
        countryCode: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const companyWithDefaults = company
      ? {
          ...company,
          currencyCode: company.currencyCode || "USD",
          currencySymbol: company.currencySymbol || "$",
          country: company.country || "",
          countryCode: company.countryCode || "",
        }
      : null;

    return NextResponse.json({
      company: companyWithDefaults,
      status: true,
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Failed to fetch Company" },
      { status: 500 }
    );
  }
}
