import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();
    const { code, discountType, discountValue, minOrderAmount, maxUses, isActive } = body;

    const [coupon] = await sql`
      UPDATE coupons
      SET 
        code = COALESCE(${code ? code.trim().toUpperCase() : null}, code),
        discount_type = COALESCE(${discountType || null}, discount_type),
        discount_value = COALESCE(${discountValue || null}, discount_value),
        min_order_amount = COALESCE(${minOrderAmount || null}, min_order_amount),
        max_uses = COALESCE(${maxUses || null}, max_uses),
        is_active = COALESCE(${isActive !== undefined ? isActive : null}, is_active)
      WHERE id = ${id}
      RETURNING 
        id, code, discount_type AS "discountType", discount_value::float AS "discountValue",
        min_order_amount::float AS "minOrderAmount", max_uses AS "maxUses", uses_count AS "usesCount",
        start_date AS "startDate", end_date AS "endDate", is_active AS "isActive", created_at AS "createdAt"
    `;

    return NextResponse.json({
      success: true,
      message: "تم تحديث الكوبون بنجاح",
      data: coupon,
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
    await sql`DELETE FROM coupons WHERE id = ${id}`;
    return NextResponse.json({
      success: true,
      message: "تم حذف الكوبون بنجاح",
      data: null,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
