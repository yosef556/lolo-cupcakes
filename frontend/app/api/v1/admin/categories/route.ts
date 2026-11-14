import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { randomUUID } from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { nameAr, nameEn, slug, displayOrder = 1, isActive = true } = body;

    const id = randomUUID();
    const [category] = await sql`
      INSERT INTO categories (
        id, slug, name_ar, name_en, display_order, is_active, created_at, updated_at
      ) VALUES (
        ${id}, ${slug}, ${nameAr}, ${nameEn || null}, ${displayOrder}, ${isActive}, NOW(), NOW()
      )
      RETURNING id, slug, name_ar AS "nameAr", name_en AS "nameEn", display_order AS "displayOrder"
    `;

    return NextResponse.json({
      success: true,
      message: "تم إنشاء القسم بنجاح",
      data: category,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
