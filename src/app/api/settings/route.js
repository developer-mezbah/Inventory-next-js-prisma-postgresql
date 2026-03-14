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
            printSettings: {
                sale: {
                    quantity: true,
                    tax: true,
                    warranty: true,
                    additionalField: false,
                    discount: true,
                    serialNumber: false,
                    notes: true
                },
                purchase: {
                    quantity: true,
                    tax: true,
                    warranty: false,
                    additionalField: true,
                    discount: false,
                    serialNumber: true,
                    notes: true
                }
            },
            // Add other default settings here
            // notificationSettings: {},
            // appearanceSettings: {},
        };

        if (settings) {
            // Merge stored settings with defaults to ensure all fields exist
            const mergedSettings = {
                formSettings: {
                    ...defaultSettings.formSettings,
                    ...(settings.formSettings || {})
                },
                printSettings: {
                    sale: {
                        ...defaultSettings.printSettings.sale,
                        ...(settings.printSettings?.sale || {})
                    },
                    purchase: {
                        ...defaultSettings.printSettings.purchase,
                        ...(settings.printSettings?.purchase || {})
                    }
                },
                // Add other categories as needed
            };

            return NextResponse.json({
                success: true,
                data: mergedSettings
            });
        }

        return NextResponse.json({
            success: true,
            data: defaultSettings
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
        
        // Ensure we have both form and print settings
        const settingsToSave = {
            formSettings: body.formSettings || {
                warranty: true,
                tax: true,
                discount: true,
            },
            printSettings: body.printSettings || {
                sale: {
                    quantity: true,
                    tax: true,
                    warranty: true,
                    additionalField: false,
                    discount: true,
                    serialNumber: false,
                    notes: true
                },
                purchase: {
                    quantity: true,
                    tax: true,
                    warranty: false,
                    additionalField: true,
                    discount: false,
                    serialNumber: true,
                    notes: true
                }
            },
        };

        const settings = await prisma.setting.upsert({
            where: { companyId },
            update: { 
                formSettings: settingsToSave.formSettings,
                printSettings: settingsToSave.printSettings
            },
            create: {
                companyId,
                formSettings: settingsToSave.formSettings,
                printSettings: settingsToSave.printSettings
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