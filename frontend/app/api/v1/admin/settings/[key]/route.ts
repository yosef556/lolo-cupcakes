import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function PUT(
  req: NextRequest,
  { params }: { params: { key: string } }
) {
  try {
    const { key } = params;
    const body = await req.json();
    const { value } = body;

    const [updated] = await sql`
      INSERT INTO store_settings (key, value, updated_at)
      VALUES (${key}, ${value}, NOW())
      ON CONFLICT (key) DO UPDATE
      SET value = EXCLUDED.value, updated_at = NOW()
      RETURNING key, value, description, updated_at AS "updatedAt"
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
