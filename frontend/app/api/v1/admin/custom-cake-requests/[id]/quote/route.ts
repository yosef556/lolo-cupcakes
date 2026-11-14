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
    const { quotedPrice, termsAndDetails, expiresInHours = 48 } = body;

    const [request] = await sql`
      SELECT * FROM custom_cake_requests
      WHERE id = ${id} OR public_reference = ${id}
      LIMIT 1
    `;

    if (!request) {
      return NextResponse.json({ success: false, message: "طلب الكيك غير موجود" }, { status: 404 });
    }

    const quoteId = randomUUID();
    const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000).toISOString();

    await sql`
      INSERT INTO custom_cake_quotes (
        id, request_id, quoted_price, terms_and_details, expires_at, status, created_at
      ) VALUES (
        ${quoteId}, ${request.id}, ${quotedPrice}, ${termsAndDetails}, ${expiresAt}, 'PENDING', NOW()
      )
    `;

    await sql`
      UPDATE custom_cake_requests
      SET status = 'QUOTED', updated_at = NOW()
      WHERE id = ${request.id}
    `;

    return NextResponse.json({
      success: true,
      message: "تم إرسال عرض السعر للعميل بنجاح",
      data: {
        id: request.id,
        publicReference: request.public_reference,
        status: "QUOTED",
        statusLabelAr: "تم تحديد عرض السعر",
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
