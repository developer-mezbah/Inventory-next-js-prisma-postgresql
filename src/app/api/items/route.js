import prisma from "@/lib/prisma";
import { getCompanyId } from "@/utils/GetCompanyId";
import { NextResponse } from "next/server";

/**
 * @route GET /api/items
 * @description Retrieves a list of all inventory items.
 */
export async function GET() {
  try {
    const items = await prisma.item.findMany({
      // Optionally include the category relation
      include: {
        category: {
          select: { name: true, subcategories: true, id: true },
        },
        transaction: { include: { party: true } },
      },
      orderBy: {
        id: "desc",
      },
      where: {
        companyId: await getCompanyId(),
      },
      // You can add filtering, sorting, or pagination here if needed
    });

    return NextResponse.json({ items }, { status: 200 });
  } catch (error) {
    console.error("Error fetching items:", error);
    return NextResponse.json(
      {
        message: "Failed to fetch items",
        error: error.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * @route POST /api/items
 * @description Creates a new inventory item.
 */
export async function POST(request) {
  try {
    const data = await request.json();

    // Basic validation for mandatory fields (like itemName and itemType)
    if (!data.itemName || !data.itemType) {
      return NextResponse.json(
        { message: "Missing required fields: itemName and itemType." },
        { status: 400 }
      );
    }

    // Ensure images array is present, even if empty, as per Prisma schema definition
    if (!data.images) {
      data.images = [];
    }

    const categoryRelation = data.categoryId
      ? {
          // Relations
          category: {
            connect: { id: data.categoryId },
          },
        }
      : {};

    const newItem = await prisma.item.create({
      data: {
        itemType: data.itemType,
        itemName: data.itemName,
        itemCode: data.itemCode,
        company: {
          connect: { id: await getCompanyId() },
        },
        // Relations
        ...categoryRelation,
        subCategoryId: data.subCategoryId,

        // Units
        baseUnit: data.baseUnit,
        secondaryUnit: data.secondaryUnit,

        // Pricing
        salePrice: data.salePrice,
        purchasePrice: data.purchasePrice,
        wholesalePrice: data.wholesalePrice,
        minimumWholesaleQty: data.minimumWholesaleQty,

        // Stock is optional and an embedded type
        stock: data.stock
          ? {
              openingQuantity: data.stock.openingQuantity,
              atPrice: data.stock.atPrice,
              asOfDate: data.stock.asOfDate,
              minStockToMaintain: data.stock.minStockToMaintain,
              location: data.stock.location || "",
            }
          : undefined,

        // Media
        images: data.images,
      },
      include: { category: true },
    });

    return NextResponse.json({ item: newItem, status: true }, { status: 201 });
  } catch (error) {
    if (
      error instanceof prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      // P2002 is a unique constraint violation (e.g., duplicate itemName or itemCode)
      return NextResponse.json(
        { message: "Item name or code already exists." },
        { status: 409 }
      );
    }
    console.error("Error creating item:", error);
    return NextResponse.json(
      {
        message: "Failed to create item",
        error: error.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}
