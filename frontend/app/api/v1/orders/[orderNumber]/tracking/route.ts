export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: { orderNumber: string } }
) {
  try {
    const { orderNumber } = params;

    const [order] = await sql`
      SELECT * FROM orders
      WHERE public_order_number = ${orderNumber} OR tracking_token = ${orderNumber}
      LIMIT 1
    `;

    if (!order) {
      return NextResponse.json({ success: false, message: "لم يتم العثور على الطلب" }, { status: 404 });
    }

    const items = await sql`
      SELECT 
        id,
        product_name_snapshot AS "productName",
        product_name_snapshot AS "productNameAr",
        variant_name_snapshot AS "variantName",
        unit_price_snapshot::float AS "unitPrice",
        quantity,
        line_total::float AS "lineTotal"
      FROM order_items
      WHERE order_id = ${order.id}
    `;

    const history = await sql`
      SELECT 
        new_status AS status,
        note,
        created_at AS timestamp
      FROM order_status_history
      WHERE order_id = ${order.id}
      ORDER BY created_at ASC
    `;

    const timeline = history.map((h: any) => ({
      status: h.status,
      statusLabelAr: getStatusLabel(h.status),
      note: h.note,
      timestamp: new Date(h.timestamp).toISOString(),
    }));

    // If timeline is empty, generate at least one event
    if (timeline.length === 0) {
      timeline.push({
        status: order.order_status,
        statusLabelAr: getStatusLabel(order.order_status),
        note: "تم استلام الطلب",
        timestamp: new Date(order.created_at).toISOString(),
      });
    }

    const data = {
      publicOrderNumber: order.public_order_number,
      trackingToken: order.tracking_token,
      orderStatus: order.order_status,
      orderStatusLabelAr: getStatusLabel(order.order_status),
      paymentStatus: order.payment_status,
      paymentStatusLabelAr: getPaymentStatusLabel(order.payment_status),
      paymentMethod: order.payment_method,
      paymentMethodLabelAr: getPaymentMethodLabel(order.payment_method),
      fulfillmentType: order.fulfillment_type,
      fulfillmentTypeLabelAr: order.fulfillment_type === 'PICKUP' ? "استلام من الفرع" : "توصيل للعنوان",
      scheduledForDate: order.scheduled_for_date ? new Date(order.scheduled_for_date).toISOString().slice(0, 10) : "",
      scheduledForTimeRange: order.scheduled_for_time_range || "",
      customerName: order.customer_name,
      customerPhone: order.customer_phone,
      subtotal: Number(order.subtotal),
      discountAmount: Number(order.discount_amount),
      deliveryFee: Number(order.delivery_fee),
      totalAmount: Number(order.total_amount),
      currency: order.currency || "EGP",
      deliveryAddressSnapshot: typeof order.delivery_address_snapshot === 'string' ? order.delivery_address_snapshot : JSON.stringify(order.delivery_address_snapshot),
      customerNotes: order.customer_notes,
      items,
      createdAt: new Date(order.created_at).toISOString(),
      timeline,
    };

    return NextResponse.json({
      success: true,
      message: "Operation successful",
      data,
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

function getPaymentMethodLabel(method: string) {
  const map: Record<string, string> = {
    CASH: "الدفع عند الاستلام",
    MANUAL_TRANSFER: "تحويل محفظة إلكترونية (فودافون كاش / إنستاباي)",
    CARD_ONLINE: "بطاقة بنكية",
  };
  return map[method] || method;
}
