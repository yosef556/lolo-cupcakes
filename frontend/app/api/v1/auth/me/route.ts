export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization') || '';
    const token = authHeader.replace(/^Bearer\s+/i, '');

    let userId: string | null = null;
    if (token) {
      try {
        const decoded = JSON.parse(Buffer.from(token, 'base64').toString('utf-8'));
        userId = decoded.userId;
      } catch {
        userId = null;
      }
    }

    if (!userId) {
      return NextResponse.json({ success: false, message: "غير مصرح" }, { status: 401 });
    }

    const [user] = await sql`
      SELECT id, email, full_name, phone, status, avatar_url, created_at
      FROM users
      WHERE id = ${userId}
      LIMIT 1
    `;

    if (!user) {
      return NextResponse.json({ success: false, message: "المستخدم غير موجود" }, { status: 404 });
    }

    const [customer] = await sql`
      SELECT notes FROM customers WHERE user_id = ${user.id} LIMIT 1
    `;

    const orders = await sql`
      SELECT * FROM orders
      WHERE customer_phone = ${user.phone} OR customer_id = ${user.id}
      ORDER BY created_at DESC
      LIMIT 10
    `;

    const recentOrders = orders.map((o: any) => ({
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
      subtotal: Number(o.subtotal),
      discountAmount: Number(o.discount_amount),
      deliveryFee: Number(o.delivery_fee),
      totalAmount: Number(o.total_amount),
      currency: o.currency || "EGP",
      createdAt: new Date(o.created_at).toISOString(),
    }));

    const isAdmin = checkIsAdmin(user.email);

    return NextResponse.json({
      success: true,
      message: "Operation successful",
      data: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        phone: user.phone,
        status: user.status,
        isAdmin,
        avatarUrl: user.avatar_url || null,
        address: customer ? customer.notes : "",
        createdAt: new Date(user.created_at).toISOString(),
        recentOrders,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

function checkIsAdmin(email?: string) {
  if (!email) return false;
  const e = email.toLowerCase();
  return e === 'admin@lolocupcakes.com' || e.startsWith('admin@') || e.includes('+admin@');
}
