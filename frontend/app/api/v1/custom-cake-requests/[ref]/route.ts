export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: { ref: string } }
) {
  try {
    const { ref } = params;

    const [request] = await sql`
      SELECT * FROM custom_cake_requests
      WHERE public_reference = ${ref} OR access_token = ${ref}
      LIMIT 1
    `;

    if (!request) {
      return NextResponse.json({ success: false, message: "لم يتم العثور على طلب الكيك المخصص" }, { status: 404 });
    }

    const quotes = await sql`
      SELECT * FROM custom_cake_quotes
      WHERE request_id = ${request.id}
      ORDER BY created_at DESC
    `;

    const mappedQuotes = quotes.map((q: any) => ({
      id: q.id,
      quotedPrice: Number(q.quoted_price),
      termsAndDetails: q.terms_and_details,
      expiresAt: new Date(q.expires_at).toISOString(),
      status: q.status,
      statusLabelAr: q.status === 'ACCEPTED' ? 'مقبول' : q.status === 'REJECTED' ? 'مرفوض' : 'في انتظار الموافقة',
      respondedAt: q.responded_at ? new Date(q.responded_at).toISOString() : undefined,
      createdAt: new Date(q.created_at).toISOString(),
      expired: new Date(q.expires_at) < new Date(),
    }));

    return NextResponse.json({
      success: true,
      message: "Operation successful",
      data: {
        id: request.id,
        publicReference: request.public_reference,
        requestReference: request.public_reference,
        accessToken: request.access_token,
        trackingToken: request.access_token,
        customerName: request.customer_name,
        customerPhone: request.customer_phone,
        customerEmail: request.customer_email,
        requestedDate: request.requested_date ? new Date(request.requested_date).toISOString().slice(0, 10) : "",
        servingsNeeded: request.servings_needed,
        flavorPreference: request.flavor_preference,
        messageOnCake: request.message_on_cake,
        notes: request.notes,
        status: request.status,
        statusLabelAr: getCustomCakeStatusLabel(request.status),
        hasReferenceImage: Boolean(request.reference_image_storage_key),
        quotes: mappedQuotes,
        createdAt: new Date(request.created_at).toISOString(),
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

function getCustomCakeStatusLabel(status: string) {
  const map: Record<string, string> = {
    PENDING_REVIEW: "قيد المراجعة وتحديد السعر",
    QUOTED: "تم تحديد عرض السعر",
    ACCEPTED: "تم قبول العرض وبدء التنفيذ",
    REJECTED: "تم رفض العرض",
    COMPLETED: "تم التسليم",
  };
  return map[status] || status;
}
