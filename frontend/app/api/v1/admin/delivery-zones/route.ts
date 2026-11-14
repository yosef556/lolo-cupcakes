export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { randomUUID } from 'crypto';

export async function GET() {
  try {
    const zones = await sql`
      SELECT 
        id, name_ar AS "nameAr", name_en AS "nameEn", delivery_fee::float AS "deliveryFee",
        min_order_amount::float AS "minOrderAmount", display_order AS "displayOrder", is_active AS "isActive"
      FROM delivery_zones
      ORDER BY display_order ASC
    `;
    return NextResponse.json({
      success: true,
      message: "Operation successful",
      data: zones,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { nameAr, nameEn, deliveryFee = 35, minOrderAmount = 0, displayOrder = 1, isActive = true } = body;

    const id = randomUUID();
    const [zone] = await sql`
      INSERT INTO delivery_zones (
        id, name_ar, name_en, delivery_fee, min_order_amount, display_order, is_active, created_at, updated_at
      ) VALUES (
        ${id}, ${nameAr}, ${nameEn || null}, ${deliveryFee}, ${minOrderAmount}, ${displayOrder}, ${isActive}, NOW(), NOW()
      )
      RETURNING 
        id, name_ar AS "nameAr", name_en AS "nameEn", delivery_fee::float AS "deliveryFee",
        min_order_amount::float AS "minOrderAmount", display_order AS "displayOrder", is_active AS "isActive"
    `;

    return NextResponse.json({
      success: true,
      message: "تم إضافة منطقة التوصيل بنجاح",
      data: zone,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
