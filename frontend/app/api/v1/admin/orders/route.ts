import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '0', 10);
    const size = parseInt(searchParams.get('size') || '20', 10);
    const offset = page * size;

    let orders;
    let totalCount;

    if (status && status !== 'ALL') {
      [totalCount] = await sql`SELECT count(*)::int AS count FROM orders WHERE order_status = ${status}`;
      orders = await sql`
        SELECT * FROM orders
        WHERE order_status = ${status}
        ORDER BY created_at DESC
        LIMIT ${size} OFFSET ${offset}
      `;
    } else {
      [totalCount] = await sql`SELECT count(*)::int AS count FROM orders`;
      orders = await sql`
        SELECT * FROM orders
        ORDER BY created_at DESC
        LIMIT ${size} OFFSET ${offset}
      `;
    }

    const mapped = orders.map((o: any) => ({
      id: o.id,
      publicOrderNumber: o.public_order_number,
      trackingToken: o.tracking_token,
      orderStatus: o.order_status,
      orderStatusLabelAr: getStatusLabel(o.order_status),
      paymentStatus: o.payment_status,
      paymentStatusLabelAr: getPaymentStatusLabel(o.payment_status),
      paymentMethod: o.payment_method,
      paymentMethodLabelAr: o.payment_method,
      fulfillmentType: o.fulfillment_type,
      fulfillmentTypeLabelAr: o.fulfillment_type === 'PICKUP' ? "استلام من الفرع" : "توصيل للعنوان",
      scheduledForDate: o.scheduled_for_date ? new Date(o.scheduled_for_date).toISOString().slice(0, 10) : "",
      scheduledForTimeRange: o.scheduled_for_time_range || "",
      customerName: o.customer_name,
      customerPhone: o.customer_phone,
      subtotal: Number(o.subtotal),
      discountAmount: Number(o.discount_amount),
      deliveryFee: Number(o.delivery_fee),
      totalAmount: Number(o.total_amount),
      currency: o.currency || "EGP",
      deliveryAddressSnapshot: typeof o.delivery_address_snapshot === 'string' ? o.delivery_address_snapshot : JSON.stringify(o.delivery_address_snapshot),
      customerNotes: o.customer_notes,
      createdAt: new Date(o.created_at).toISOString(),
    }));

    return NextResponse.json({
      success: true,
      message: "Operation successful",
      data: {
        content: mapped,
        totalElements: totalCount.count,
        totalPages: Math.ceil(totalCount.count / size),
      },
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
