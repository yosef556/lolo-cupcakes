export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    const [branch] = await sql`
      SELECT id, name_ar AS "nameAr", address_ar AS "addressAr", phone
      FROM branches
      WHERE is_active = true
      LIMIT 1
    `;

    const data = branch || {
      id: "2d0be48c-7fe8-4b42-9df8-865931fe9e77",
      nameAr: "فرع القاهرة الرئيسي",
      addressAr: "الشيخ زايد، الجيزة",
      phone: "01069915609",
    };

    return NextResponse.json({
      success: true,
      message: "Operation successful",
      data,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
