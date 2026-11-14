export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json().catch(() => ({}));
    const note = body.note || "تم تأكيد واعتماد الدفع";

    const [payment] = await sql`SELECT * FROM payments WHERE id = ${id} LIMIT 1`;
    if (!payment) {
      return NextResponse.json({ success: false, message: "سجل الدفع غير موجود" }, { status: 404 });
    }

    await sql`
      UPDATE payments
      SET status = 'APPROVED', review_note = ${note}, reviewed_at = NOW(), updated_at = NOW()
      WHERE id = ${payment.id}
    `;

    await sql`
      UPDATE orders
      SET payment_status = 'PAID', updated_at = NOW()
      WHERE id = ${payment.order_id}
    `;

    return NextResponse.json({
      success: true,
      message: "تم اعتماد الدفع بنجاح",
      data: {
        id: payment.id,
        orderId: payment.order_id,
        status: "APPROVED",
        reviewNote: note,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
