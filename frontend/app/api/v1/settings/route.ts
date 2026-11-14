import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    const rows = await sql`SELECT setting_key as key, setting_value as value FROM store_settings`;
    const settings: Record<string, string> = {};
    for (const row of rows) {
      settings[row.key] = row.value;
    }
    return NextResponse.json({
      success: true,
      message: "Operation successful",
      data: settings,
      timestamp: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json({
      success: true,
      message: "Default settings",
      data: {
        store_open: "true",
        currency: "EGP",
        store_name: "Lolo Cupcakes",
        phone: "+201000000000",
      },
      timestamp: new Date().toISOString(),
    });
  }
}
