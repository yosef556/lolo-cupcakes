export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Get user details to match both user_id and phone
    const [user] = await sql`SELECT id, phone, full_name, email FROM users WHERE id = ${id} LIMIT 1`;
    if (!user) {
      return NextResponse.json({ success: false, message: "العميل غير موجود" }, { status: 404 });
    }

    const cleanPhone = user.phone ? user.phone.trim() : '';

    const orders = cleanPhone ? await sql`
      SELECT 
        o.id,
        o.public_order_number AS "orderNumber",
        o.public_order_number AS "publicOrderNumber",
        o.order_status AS "status",
        o.order_status AS "orderStatus",
        o.payment_status AS "paymentStatus",
        o.payment_method AS "paymentMethod",
        o.fulfillment_type AS "fulfillmentType",
        o.scheduled_for_date AS "scheduledDate",
        o.scheduled_for_time_range AS "scheduledTime",
        o.subtotal::float AS "subtotal",
        o.discount_amount::float AS "discountAmount",
        o.delivery_fee::float AS "deliveryFee",
        o.total_amount::float AS "totalAmount",
        o.customer_notes AS "customerNotes",
        o.created_at AS "createdAt",
        COALESCE(
          (
            SELECT json_agg(json_build_object(
              'productNameAr', oi.product_name_snapshot,
              'productName', oi.product_name_snapshot,
              'quantity', oi.quantity,
              'unitPrice', oi.unit_price_snapshot::float,
              'lineTotal', oi.line_total::float
            ))
            FROM order_items oi
            WHERE oi.order_id = o.id
          ),
          '[]'::json
        ) AS items
      FROM orders o
      WHERE o.customer_id = ${id} OR o.customer_phone = ${cleanPhone}
      ORDER BY o.created_at DESC
    ` : await sql`
      SELECT 
        o.id,
        o.public_order_number AS "orderNumber",
        o.public_order_number AS "publicOrderNumber",
        o.order_status AS "status",
        o.order_status AS "orderStatus",
        o.payment_status AS "paymentStatus",
        o.payment_method AS "paymentMethod",
        o.fulfillment_type AS "fulfillmentType",
        o.scheduled_for_date AS "scheduledDate",
        o.scheduled_for_time_range AS "scheduledTime",
        o.subtotal::float AS "subtotal",
        o.discount_amount::float AS "discountAmount",
        o.delivery_fee::float AS "deliveryFee",
        o.total_amount::float AS "totalAmount",
        o.customer_notes AS "customerNotes",
        o.created_at AS "createdAt",
        COALESCE(
          (
            SELECT json_agg(json_build_object(
              'productNameAr', oi.product_name_snapshot,
              'productName', oi.product_name_snapshot,
              'quantity', oi.quantity,
              'unitPrice', oi.unit_price_snapshot::float,
              'lineTotal', oi.line_total::float
            ))
            FROM order_items oi
            WHERE oi.order_id = o.id
          ),
          '[]'::json
        ) AS items
      FROM orders o
      WHERE o.customer_id = ${id}
      ORDER BY o.created_at DESC
    `;

    return NextResponse.json({
      success: true,
      message: "Customer orders fetched successfully",
      data: orders,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
