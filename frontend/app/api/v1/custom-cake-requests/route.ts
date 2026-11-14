export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { randomUUID } from 'crypto';

export async function POST(req: NextRequest) {
  try {
    let payload: any = {};
    const contentType = req.headers.get('content-type') || '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const rawData = formData.get('data');
      if (typeof rawData === 'string') {
        payload = JSON.parse(rawData);
      } else if (rawData instanceof Blob) {
        const text = await rawData.text();
        payload = JSON.parse(text);
      }
    } else {
      payload = await req.json();
    }

    const {
      customerName,
      customerPhone,
      customerEmail,
      requestedDate,
      servingsNeeded,
      flavorPreference,
      messageOnCake,
      notes,
    } = payload;

    const id = randomUUID();
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const rand = Math.floor(1000 + Math.random() * 9000);
    const publicReference = `CC-${today}-${rand}`;
    const accessToken = randomUUID().replace(/-/g, '');

    await sql`
      INSERT INTO custom_cake_requests (
        id, public_reference, access_token, customer_name, customer_phone, customer_email,
        requested_date, servings_needed, flavor_preference, message_on_cake, notes,
        status, created_at, updated_at
      ) VALUES (
        ${id}, ${publicReference}, ${accessToken}, ${customerName}, ${customerPhone}, ${customerEmail || null},
        ${requestedDate ? new Date(requestedDate).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10)},
        ${servingsNeeded || null}, ${flavorPreference || null}, ${messageOnCake || null}, ${notes || null},
        'PENDING_REVIEW', NOW(), NOW()
      )
    `;

    return NextResponse.json({
      success: true,
      message: "تم استلام طلب التورتة المخصصة بنجاح",
      data: {
        id,
        publicReference,
        requestReference: publicReference,
        accessToken,
        trackingToken: accessToken,
        customerName,
        customerPhone,
        customerEmail,
        requestedDate,
        servingsNeeded,
        flavorPreference,
        messageOnCake,
        notes,
        status: "PENDING_REVIEW",
        statusLabelAr: "قيد المراجعة وتحديد السعر",
        hasReferenceImage: false,
        quotes: [],
        createdAt: new Date().toISOString(),
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
