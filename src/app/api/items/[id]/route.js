import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCompanyId } from '@/utils/GetCompanyId';

/**
 * @route GET /api/items/[id]
 * @description Retrieves a single item by its MongoDB ObjectId.
 */
export async function GET(request, { params }) {
    const { id } = await params;

    try {
        const item = await prisma.item.findUnique({
            where: { id: id, companyId: await getCompanyId() },
            include: { category: true },
        });

        if (!item) {
            return NextResponse.json({ message: 'Item not found.' }, { status: 404 });
        }

        return NextResponse.json({ item }, { status: 200 });

    } catch (error) {
        console.error(`Error fetching item ${id}:`, error);
        return NextResponse.json(
            { message: 'Failed to fetch item', error: error.message || 'Unknown error' },
            { status: 500 }
        );
    }
}

/**
 * @route PUT /api/items/[id]
 * @description Updates an existing item by its MongoDB ObjectId.
 */
export async function PUT(request, { params }) {
    const { id } = await params;

    try {
        const data = await request.json();

        // Prepare the update payload, ensuring the stock update is handled correctly
        const updateData = { ...data };


        const updatedItem = await prisma.item.update({
            where: { id, companyId: await getCompanyId() },
            data: updateData,
            include: { category: true },
        });

        return NextResponse.json({ item: updatedItem }, { status: 200 });

    } catch (error) {
        if (error instanceof prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2025') {
                // P2025: Record to update not found
                return NextResponse.json({ message: `Item with ID ${id} not found.` }, { status: 404 });
            } else if (error.code === 'P2002') {
                // P2002: Unique constraint violation (e.g., trying to update to a duplicate name)
                return NextResponse.json(
                    { message: 'Update failed: Item name or code already exists.' },
                    { status: 409 }
                );
            }
        }
        console.error(`Error updating item ${id}:`, error);
        return NextResponse.json(
            { message: 'Failed to update item', error: error.message || 'Unknown error' },
            { status: 500 }
        );
    }
}

/**
 * @route DELETE /api/items/[id]
 * @description Deletes an item by its MongoDB ObjectId.
 */
export async function DELETE(request, { params }) {
    const { id } = await params;

    try {
        await prisma.item.delete({
            where: { id, companyId: await getCompanyId() },
        });

        return NextResponse.json({ message: 'Item successfully deleted.', status: true }, { status: 200 });

    } catch (error) {
        if (error instanceof prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
            // P2025: Record to delete not found
            return NextResponse.json({ message: `Item with ID ${id} not found.` }, { status: 404 });
        }
        console.error(`Error deleting item ${id}:`, error);
        return NextResponse.json(
            { message: 'Failed to delete item', error: error.message || 'Unknown error' },
            { status: 500 }
        );
    }
}