// app/api/settings/route.js
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCompanyId } from '@/utils/GetCompanyId';

export async function GET(request) {
    try {
        const companyId = await getCompanyId();
        const settings = await prisma.setting.findUnique({
            where: { companyId },
        });

        // Default settings
        const defaultSettings = {
            formSettings: {
                warranty: true,
                tax: true,
                discount: true,
            },
            // Add other default settings here
        };

        return NextResponse.json({
            success: true,
            data: settings?.formSettings ? {
                formSettings: settings.formSettings,
                // Add other settings categories here
            } : defaultSettings
        });
    } catch (error) {
        console.error('Error fetching settings:', error);
        return NextResponse.json(
            { error: 'Failed to fetch settings' },
            { status: 500 }
        );
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        const companyId = await getCompanyId();
        const settings = await prisma.setting.upsert({
            where: { companyId },
            update: { formSettings: body.formSettings },
            create: {
                companyId,
                formSettings: body.formSettings,
            },
        });

        return NextResponse.json({
            success: true,
            data: settings
        });
    } catch (error) {
        console.error('Error saving settings:', error);
        return NextResponse.json(
            { error: 'Failed to save settings' },
            { status: 500 }
        );
    }
}