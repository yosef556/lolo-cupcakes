export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    let payments;
    if (status) {
      payments = await sql`
        SELECT * FROM payments
        WHERE status = ${status}
        ORDER BY created_at DESC
      `;
    } else {
      payments = await sql`
        SELECT * FROM payments
        ORDER BY created_at DESC
      `;
    }

    const mapped = [];
    for (const p of payments) {
      const proofs = await sql`
        SELECT id, original_filename AS "originalFilename", file_size AS "fileSize", mime_type AS "mimeType", uploaded_at AS "uploadedAt"
        FROM payment_proofs
        WHERE payment_id = ${p.id}
      `;
      mapped.push({
        id: p.id,
        orderId: p.order_id,
        paymentMethod: p.payment_method,
        amount: Number(p.amount),
        currency: p.currency,
        status: p.status,
        paymentReference: p.payment_reference,
        reviewNote: p.review_note,
        proofs,
        createdAt: new Date(p.created_at).toISOString(),
      });
    }

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
