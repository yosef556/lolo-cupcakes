import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { randomUUID } from 'crypto';

export async function POST(
  req: NextRequest,
  { params }: { params: { orderNumber: string } }
) {
  try {
    const { orderNumber } = params;
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const senderPhone = (formData.get('senderPhone') as string) || '';
    const senderName = (formData.get('senderName') as string) || '';
    const transactionRef = (formData.get('transactionRef') as string) || '';

    const [order] = await sql`
      SELECT id, total_amount, currency, customer_notes FROM orders
      WHERE public_order_number = ${orderNumber}
      LIMIT 1
    `;

    if (!order) {
      return NextResponse.json({ success: false, message: "لم يتم العثور على الطلب" }, { status: 404 });
    }

    const paymentId = randomUUID();
    const proofId = randomUUID();
    const filename = file?.name || 'payment_proof.jpg';
    const fileSize = file?.size || 0;
    const mimeType = file?.type || 'image/jpeg';
    const storageKey = `proofs/${orderNumber}_${Date.now()}_${filename}`;

    await sql`
      INSERT INTO payments (
        id, order_id, payment_method, amount, currency, status, payment_reference, created_at, updated_at
      ) VALUES (
        ${paymentId}, ${order.id}, 'MANUAL_TRANSFER', ${order.total_amount}, ${order.currency || 'EGP'},
        'PENDING_VERIFICATION', ${transactionRef || senderPhone || null}, NOW(), NOW()
      )
    `;

    await sql`
      INSERT INTO payment_proofs (
        id, payment_id, original_filename, storage_key, mime_type, file_size, uploaded_at
      ) VALUES (
        ${proofId}, ${paymentId}, ${filename}, ${storageKey}, ${mimeType}, ${fileSize}, NOW()
      )
    `;

    let notesUpdate = order.customer_notes || '';
    if (senderPhone) {
      notesUpdate += ` | [رقم تحويل فودافون كاش/إنستاباي المُرسِل: ${senderPhone}]`;
    }
    if (transactionRef) {
      notesUpdate += ` | [رقم الحوالة: ${transactionRef}]`;
    }
    notesUpdate += ' | [تم إرفاق إيصال الدفع بنجاح]';

    await sql`
      UPDATE orders
      SET customer_notes = ${notesUpdate}, updated_at = NOW()
      WHERE id = ${order.id}
    `;

    return NextResponse.json({
      success: true,
      message: "تم رفع إيصال الدفع بنجاح وفي انتظار المراجعة",
      data: {
        id: proofId,
        paymentId,
        originalFilename: filename,
        fileSize,
        mimeType,
        uploadedAt: new Date().toISOString(),
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
