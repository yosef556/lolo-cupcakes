import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    const [ordersCount] = await sql`SELECT count(*)::int AS count FROM orders`;
    const [todayOrders] = await sql`SELECT count(*)::int AS count FROM orders WHERE created_at >= CURRENT_DATE`;
    const [pendingOrders] = await sql`SELECT count(*)::int AS count FROM orders WHERE order_status IN ('RECEIVED', 'CONFIRMED', 'PREPARING')`;
    const [pendingPayments] = await sql`SELECT count(*)::int AS count FROM payments WHERE status = 'PENDING_VERIFICATION'`;
    const [pendingCakes] = await sql`SELECT count(*)::int AS count FROM custom_cake_requests WHERE status = 'PENDING_REVIEW'`;
    const [totalSales] = await sql`SELECT COALESCE(sum(total_amount), 0)::float AS total FROM orders WHERE order_status != 'CANCELLED'`;
    const [todaySales] = await sql`SELECT COALESCE(sum(total_amount), 0)::float AS total FROM orders WHERE order_status != 'CANCELLED' AND created_at >= CURRENT_DATE`;

    const recent = await sql`
      SELECT * FROM orders
      ORDER BY created_at DESC
      LIMIT 10
    `;

    const mappedRecent = recent.map((o: any) => ({
      id: o.id,
      publicOrderNumber: o.public_order_number,
      trackingToken: o.tracking_token,
      orderStatus: o.order_status,
      orderStatusLabelAr: o.order_status,
      paymentStatus: o.payment_status,
      paymentStatusLabelAr: o.payment_status,
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
      createdAt: new Date(o.created_at).toISOString(),
    }));

    return NextResponse.json({
      success: true,
      message: "Operation successful",
      data: {
        totalOrdersCount: ordersCount.count,
        todayOrdersCount: todayOrders.count,
        pendingOrdersCount: pendingOrders.count,
        pendingPaymentsCount: pendingPayments.count,
        pendingCustomCakesCount: pendingCakes.count,
        totalSalesEgp: totalSales.total,
        todaySalesEgp: todaySales.total,
        recentOrders: mappedRecent,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
