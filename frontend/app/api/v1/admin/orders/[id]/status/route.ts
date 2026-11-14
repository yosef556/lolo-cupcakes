import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { randomUUID } from 'crypto';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();
    const { newStatus, note = "" } = body;

    const [order] = await sql`
      SELECT * FROM orders
      WHERE id = ${id} OR public_order_number = ${id}
      LIMIT 1
    `;

    if (!order) {
      return NextResponse.json({ success: false, message: "الطلب غير موجود" }, { status: 404 });
    }

    await sql`
      UPDATE orders
      SET order_status = ${newStatus}, updated_at = NOW()
      WHERE id = ${order.id}
    `;

    await sql`
      INSERT INTO order_status_history (id, order_id, previous_status, new_status, note, created_at)
      VALUES (${randomUUID()}, ${order.id}, ${order.order_status}, ${newStatus}, ${note || 'تحديث حالة الطلب'}, NOW())
    `;

    return NextResponse.json({
      success: true,
      message: "تم تحديث حالة الطلب بنجاح",
      data: {
        id: order.id,
        publicOrderNumber: order.public_order_number,
        orderStatus: newStatus,
        updatedAt: new Date().toISOString(),
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
