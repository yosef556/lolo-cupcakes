export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    const users = await sql`
      SELECT 
        u.id,
        u.full_name AS "fullName",
        u.email,
        u.phone,
        u.status,
        COALESCE(u.customer_tier, 'NORMAL') AS "customerTier",
        COALESCE(u.loyalty_points, 0)::int AS "loyaltyPoints",
        u.avatar_url AS "avatarUrl",
        u.created_at AS "createdAt",
        c.notes AS address,
        (SELECT count(*)::int FROM orders o WHERE o.customer_phone = u.phone OR o.customer_id = u.id) AS "totalOrders",
        (SELECT COALESCE(sum(o.total_amount), 0)::float FROM orders o WHERE (o.customer_phone = u.phone OR o.customer_id = u.id) AND o.order_status != 'CANCELLED') AS "totalSpent"
      FROM users u
      LEFT JOIN customers c ON u.id = c.user_id
      ORDER BY u.created_at DESC
    `;

    const mapped = users.map((u: any) => ({
      ...u,
      isAdmin: checkIsAdmin(u.email),
      createdAt: new Date(u.createdAt).toISOString(),
    }));

    return NextResponse.json({
      success: true,
      message: "Operation successful",
      data: mapped,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

function checkIsAdmin(email?: string) {
  if (!email) return false;
  const e = email.toLowerCase();
  return e === 'admin@lolocupcakes.com' || e.startsWith('admin@') || e.includes('+admin@');
}
