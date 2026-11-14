export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();
    const { loyaltyPoints, customerTier, status } = body;

    // Determine status sync if customerTier is changed to BLOCKED
    let newStatus = status;
    if (customerTier === 'BLOCKED') {
      newStatus = 'BLOCKED';
    } else if (customerTier && customerTier !== 'BLOCKED' && status === undefined) {
      newStatus = 'ACTIVE';
    }

    const [updated] = await sql`
      UPDATE users
      SET
        loyalty_points = COALESCE(${loyaltyPoints !== undefined ? loyaltyPoints : null}, loyalty_points),
        customer_tier = COALESCE(${customerTier || null}, customer_tier),
        status = COALESCE(${newStatus || null}, status),
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING 
        id, 
        full_name AS "fullName", 
        email, 
        phone, 
        status, 
        customer_tier AS "customerTier", 
        loyalty_points AS "loyaltyPoints"
    `;

    if (!updated) {
      return NextResponse.json({ success: false, message: "العميل غير موجود" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "تم تحديث بيانات العميل ونقاط الولاء بنجاح",
      data: updated,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
