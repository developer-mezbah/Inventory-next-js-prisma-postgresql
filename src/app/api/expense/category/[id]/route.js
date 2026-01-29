import { getCompanyId } from "@/utils/GetCompanyId";
import { NextResponse } from "next/server";

// DELETE
export async function DELETE(req, { params }) {
    try {
        const { id } = await params;
        const companyId = await getCompanyId();
        await prisma.ExpenseCategory.delete({
            where: { id },
        });

        return NextResponse.json({
            message: "Category and associated opening balance deleted successfully",
            status: true,
        });
    } catch (error) {
        console.error("Error deleting Category:", error);
        return NextResponse.json(
            { error: error.message || "Failed to delete Category" },
            { status: 500 }
        );
    }
}


// UPDATE
export async function PUT(req, { params }) {
    try {
        const body = await req.json();
        const { id } = await params;

        const updated = await prisma.ExpenseCategory.update({
            where: { id, companyId: await getCompanyId() },
            data: body,
        });

        return NextResponse.json({ data: updated, message: "Category updated successfully", status: true });
    } catch (error) {
        return NextResponse.json({ error: error || "Failed to update category" }, { status: 500 });
    }
}