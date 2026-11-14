import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json().catch(() => ({}));
    const note = body.note || "تم رفض الدفع لعدم وضوح الإيصال";

    const [payment] = await sql`SELECT * FROM payments WHERE id = ${id} LIMIT 1`;
    if (!payment) {
      return NextResponse.json({ success: false, message: "سجل الدفع غير موجود" }, { status: 404 });
    }

    await sql`
      UPDATE payments
      SET status = 'REJECTED', review_note = ${note}, reviewed_at = NOW(), updated_at = NOW()
      WHERE id = ${payment.id}
    `;

    return NextResponse.json({
      success: true,
      message: "تم رفض الدفع",
      data: {
        id: payment.id,
        orderId: payment.order_id,
        status: "REJECTED",
        reviewNote: note,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
