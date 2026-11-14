export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();
    const { nameAr, nameEn, slug, displayOrder } = body;

    const [category] = await sql`
      UPDATE categories
      SET 
        name_ar = COALESCE(${nameAr || null}, name_ar),
        name_en = COALESCE(${nameEn || null}, name_en),
        slug = COALESCE(${slug || null}, slug),
        display_order = COALESCE(${displayOrder || null}, display_order),
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING id, slug, name_ar AS "nameAr", name_en AS "nameEn", display_order AS "displayOrder"
    `;

    return NextResponse.json({
      success: true,
      message: "تم تحديث القسم بنجاح",
      data: category,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    await sql`DELETE FROM categories WHERE id = ${id}`;
    return NextResponse.json({
      success: true,
      message: "تم حذف القسم بنجاح",
      data: null,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
