export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { randomUUID } from 'crypto';

export async function POST(
  req: NextRequest,
  { params }: { params: { orderNumber: string } }
) {
  try {
    const { orderNumber } = params;
    const body = await req.json().catch(() => ({}));
    const reason = body.reason || "إلغاء بواسطة العميل";

    const [order] = await sql`
      SELECT * FROM orders
      WHERE public_order_number = ${orderNumber}
      LIMIT 1
    `;

    if (!order) {
      return NextResponse.json({ success: false, message: "لم يتم العثور على الطلب" }, { status: 404 });
    }

    if (['DELIVERED', 'OUT_FOR_DELIVERY', 'CANCELLED'].includes(order.order_status)) {
      return NextResponse.json({ success: false, message: "لا يمكن إلغاء الطلب في هذه المرحلة" }, { status: 400 });
    }

    await sql`
      UPDATE orders
      SET order_status = 'CANCELLED', updated_at = NOW()
      WHERE id = ${order.id}
    `;

    await sql`
      INSERT INTO order_status_history (id, order_id, previous_status, new_status, note, created_at)
      VALUES (${randomUUID()}, ${order.id}, ${order.order_status}, 'CANCELLED', ${reason}, NOW())
    `;

    return NextResponse.json({
      success: true,
      message: "تم إلغاء الطلب بنجاح",
      data: {
        publicOrderNumber: order.public_order_number,
        orderStatus: "CANCELLED",
        orderStatusLabelAr: "ملغي",
        paymentStatus: order.payment_status,
        paymentStatusLabelAr: "غير مدفوع",
        fulfillmentType: order.fulfillment_type,
        fulfillmentTypeLabelAr: order.fulfillment_type === 'PICKUP' ? "استلام من الفرع" : "توصيل للعنوان",
        totalAmount: Number(order.total_amount),
        currency: order.currency || "EGP",
        timeline: [],
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
