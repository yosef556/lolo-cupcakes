import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    const zones = await sql`
      SELECT 
        id, 
        name_ar AS "nameAr", 
        name_en AS "nameEn", 
        delivery_fee::float AS "deliveryFee", 
        min_order_amount::float AS "minOrderAmount", 
        display_order AS "displayOrder",
        is_active AS "isActive"
      FROM delivery_zones
      WHERE is_active = true
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
