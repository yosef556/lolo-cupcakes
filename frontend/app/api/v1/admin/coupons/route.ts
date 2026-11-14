export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { randomUUID } from 'crypto';

export async function GET() {
  try {
    const coupons = await sql`
      SELECT 
        id, code, discount_type AS "discountType", discount_value::float AS "discountValue",
        min_order_amount::float AS "minOrderAmount", max_uses AS "maxUses", uses_count AS "usesCount",
        start_date AS "startDate", end_date AS "endDate", is_active AS "isActive", created_at AS "createdAt"
      FROM coupons
      ORDER BY created_at DESC
    `;

    return NextResponse.json({
      success: true,
      message: "Operation successful",
      data: coupons,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      code,
      discountType = "PERCENTAGE",
      discountValue,
      minOrderAmount = 0,
      maxUses = 100,
      startDate,
      endDate,
      isActive = true,
    } = body;

    const id = randomUUID();
    const [coupon] = await sql`
      INSERT INTO coupons (
        id, code, discount_type, discount_value, min_order_amount,
        max_uses, uses_count, start_date, end_date, is_active, created_at
      ) VALUES (
        ${id}, ${code.trim().toUpperCase()}, ${discountType}, ${discountValue}, ${minOrderAmount},
        ${maxUses}, 0, ${startDate || null}, ${endDate || null}, ${isActive}, NOW()
      )
      RETURNING 
        id, code, discount_type AS "discountType", discount_value::float AS "discountValue",
        min_order_amount::float AS "minOrderAmount", max_uses AS "maxUses", uses_count AS "usesCount",
        start_date AS "startDate", end_date AS "endDate", is_active AS "isActive", created_at AS "createdAt"
    `;

    return NextResponse.json({
      success: true,
      message: "تم إنشاء الكوبون بنجاح",
      data: coupon,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
