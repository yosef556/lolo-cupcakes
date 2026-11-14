import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '0', 10);
    const size = parseInt(searchParams.get('size') || '20', 10);
    const offset = page * size;

    let requests;
    let totalCount;

    if (status && status !== 'ALL') {
      [totalCount] = await sql`SELECT count(*)::int AS count FROM custom_cake_requests WHERE status = ${status}`;
      requests = await sql`
        SELECT * FROM custom_cake_requests
        WHERE status = ${status}
        ORDER BY created_at DESC
        LIMIT ${size} OFFSET ${offset}
      `;
    } else {
      [totalCount] = await sql`SELECT count(*)::int AS count FROM custom_cake_requests`;
      requests = await sql`
        SELECT * FROM custom_cake_requests
        ORDER BY created_at DESC
        LIMIT ${size} OFFSET ${offset}
      `;
    }

    const mapped = requests.map((r: any) => ({
      id: r.id,
      publicReference: r.public_reference,
      requestReference: r.public_reference,
      accessToken: r.access_token,
      trackingToken: r.access_token,
      customerName: r.customer_name,
      customerPhone: r.customer_phone,
      customerEmail: r.customer_email,
      requestedDate: r.requested_date ? new Date(r.requested_date).toISOString().slice(0, 10) : "",
      servingsNeeded: r.servings_needed,
      flavorPreference: r.flavor_preference,
      messageOnCake: r.message_on_cake,
      notes: r.notes,
      status: r.status,
      statusLabelAr: r.status === 'PENDING_REVIEW' ? 'قيد المراجعة' : r.status === 'QUOTED' ? 'تم تحديد السعر' : r.status,
      hasReferenceImage: Boolean(r.reference_image_storage_key),
      quotes: [],
      createdAt: new Date(r.created_at).toISOString(),
    }));

    return NextResponse.json({
      success: true,
      message: "Operation successful",
      data: {
        content: mapped,
        totalElements: totalCount.count,
        totalPages: Math.ceil(totalCount.count / size),
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
