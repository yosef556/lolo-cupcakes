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
    const { nameAr, nameEn, deliveryFee, minOrderAmount, displayOrder, isActive } = body;

    const [zone] = await sql`
      UPDATE delivery_zones
      SET 
        name_ar = COALESCE(${nameAr || null}, name_ar),
        name_en = COALESCE(${nameEn || null}, name_en),
        delivery_fee = COALESCE(${deliveryFee || null}, delivery_fee),
        min_order_amount = COALESCE(${minOrderAmount || null}, min_order_amount),
        display_order = COALESCE(${displayOrder || null}, display_order),
        is_active = COALESCE(${isActive !== undefined ? isActive : null}, is_active),
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING 
        id, name_ar AS "nameAr", name_en AS "nameEn", delivery_fee::float AS "deliveryFee",
        min_order_amount::float AS "minOrderAmount", display_order AS "displayOrder", is_active AS "isActive"
    `;

    return NextResponse.json({
      success: true,
      message: "تم تحديث منطقة التوصيل بنجاح",
      data: zone,
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
    // Safely unlink any historical orders and addresses before deleting to guarantee zero constraint errors
    await sql`UPDATE orders SET delivery_zone_id = NULL WHERE delivery_zone_id = ${id}`.catch(() => {});
    await sql`UPDATE customer_addresses SET zone_id = NULL WHERE zone_id = ${id}`.catch(() => {});
    await sql`DELETE FROM delivery_zones WHERE id = ${id}`;
    return NextResponse.json({
      success: true,
      message: "تم حذف منطقة التوصيل بنجاح",
      data: null,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
