import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    const settings = await sql`
      SELECT 
        setting_key AS key, 
        setting_value AS value, 
        description, 
        updated_at AS "updatedAt" 
      FROM store_settings 
      ORDER BY setting_key ASC
    `;
    return NextResponse.json({
      success: true,
      message: "Operation successful",
      data: settings,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
