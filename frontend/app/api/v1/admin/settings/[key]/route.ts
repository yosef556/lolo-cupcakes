export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { randomUUID } from 'crypto';

export async function PUT(
  req: NextRequest,
  { params }: { params: { key: string } }
) {
  try {
    const { key } = params;
    const body = await req.json();
    const { value } = body;
    const newId = randomUUID();

    const [updated] = await sql`
      INSERT INTO store_settings (id, setting_key, setting_value, updated_at)
      VALUES (${newId}, ${key}, ${value}, NOW())
      ON CONFLICT (setting_key) DO UPDATE
      SET setting_value = EXCLUDED.setting_value, updated_at = NOW()
      RETURNING setting_key AS key, setting_value AS value, description, updated_at AS "updatedAt"
    `;

    return NextResponse.json({
      success: true,
      message: "تم تحديث الإعداد بنجاح",
      data: updated,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
