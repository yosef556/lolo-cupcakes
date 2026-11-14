import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    const categories = await sql`
      SELECT id, slug, name_ar AS "nameAr", name_en AS "nameEn", display_order AS "displayOrder"
      FROM categories 
      WHERE is_active = true 
      ORDER BY display_order ASC
    `;
    return NextResponse.json({
      success: true,
      message: "Operation successful",
      data: categories,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
