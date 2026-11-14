export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    const [row] = await sql`SELECT 1 as alive`;
    return NextResponse.json({
      success: true,
      message: "Operation successful",
      data: {
        status: "UP",
        service: "lolo-cupcakes-edge",
        database: row ? "UP" : "DOWN",
        businessTimezone: "Africa/Cairo",
        businessTimeCairo: new Date().toISOString(),
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: error.message,
      data: { status: "DOWN", database: "ERROR" },
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}
