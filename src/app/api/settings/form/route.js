// app/api/settings/form/route.js
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Adjust import path as needed
import { getCompanyId } from '@/utils/GetCompanyId';

export async function GET(request) {
  try {
    const companyId = await getCompanyId();

    if (!companyId) {
      return NextResponse.json(
        { error: 'Company ID is required' },
        { status: 400 }
      );
    }

    const settings = await prisma.setting.findUnique({
      where: { companyId },
      select: { formSettings: true }
    });

    return NextResponse.json({
      success: true,
      formSettings: settings?.formSettings || {
        warranty: true,
        tax: true,
        discount: false
      }
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
    const { formSettings } = body;
    const companyId = await getCompanyId();

    if (!companyId) {
      return NextResponse.json(
        { error: 'Company ID is required' },
        { status: 400 }
      );
    }

    // Upsert settings (create if not exists, update if exists)
    const settings = await prisma.setting.upsert({
      where: { companyId },
      update: { formSettings },
      create: {
        companyId,
        formSettings,
      },
    });

    return NextResponse.json({
      success: true,
      data: settings,
      message: 'Settings saved successfully'
    });
  } catch (error) {
    console.error('Error saving settings:', error);
    return NextResponse.json(
      { error: 'Failed to save settings' },
      { status: 500 }
    );
  }
}