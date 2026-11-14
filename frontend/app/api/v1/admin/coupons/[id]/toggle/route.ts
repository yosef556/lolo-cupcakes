import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const [coupon] = await sql`
      UPDATE coupons
      SET is_active = NOT is_active
      WHERE id = ${id}
      RETURNING 
        id, code, discount_type AS "discountType", discount_value::float AS "discountValue",
        min_order_amount::float AS "minOrderAmount", max_uses AS "maxUses", uses_count AS "usesCount",
        start_date AS "startDate", end_date AS "endDate", is_active AS "isActive", created_at AS "createdAt"
    `;

    return NextResponse.json({
      success: true,
      message: "تم تغيير حالة الكوبون بنجاح",
      data: coupon,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
