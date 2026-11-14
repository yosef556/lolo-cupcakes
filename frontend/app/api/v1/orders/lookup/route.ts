export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('query') || '';

    if (!query.trim()) {
      return NextResponse.json({ success: true, message: "No query provided", data: [] });
    }

    const cleanQuery = query.trim();
    const orders = await sql`
      SELECT * FROM orders
      WHERE public_order_number ILIKE ${'%' + cleanQuery + '%'}
         OR customer_phone ILIKE ${'%' + cleanQuery + '%'}
         OR tracking_token = ${cleanQuery}
      ORDER BY created_at DESC
      LIMIT 20
    `;

    const mapped = orders.map((order: any) => ({
      publicOrderNumber: order.public_order_number,
      trackingToken: order.tracking_token,
      orderStatus: order.order_status,
      orderStatusLabelAr: getStatusLabel(order.order_status),
      paymentStatus: order.payment_status,
      paymentStatusLabelAr: getPaymentStatusLabel(order.payment_status),
      fulfillmentType: order.fulfillment_type,
      fulfillmentTypeLabelAr: order.fulfillment_type === 'PICKUP' ? "استلام من الفرع" : "توصيل للعنوان",
      scheduledForDate: order.scheduled_for_date ? new Date(order.scheduled_for_date).toISOString().slice(0, 10) : "",
      scheduledForTimeRange: order.scheduled_for_time_range || "",
      customerName: order.customer_name,
      customerPhone: order.customer_phone,
      totalAmount: Number(order.total_amount),
      currency: order.currency || "EGP",
      createdAt: new Date(order.created_at).toISOString(),
      timeline: [],
    }));

    return NextResponse.json({
      success: true,
      message: "Operation successful",
      data: mapped,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

function getStatusLabel(status: string) {
  const map: Record<string, string> = {
    RECEIVED: "تم استلام الطلب",
    CONFIRMED: "مؤكد",
    PREPARING: "قيد التجهيز",
    OUT_FOR_DELIVERY: "جاري التوصيل",
    READY_FOR_PICKUP: "جاهز للاستلام",
    DELIVERED: "تم التوصيل",
    CANCELLED: "ملغي",
  };
  return map[status] || status;
}

function getPaymentStatusLabel(status: string) {
  const map: Record<string, string> = {
    PENDING: "في انتظار الدفع",
    UNPAID: "غير مدفوع",
    PAID: "تم الدفع",
    FAILED: "فشل الدفع",
  };
  return map[status] || status;
}
