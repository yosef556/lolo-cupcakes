import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function PUT(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization') || '';
    const token = authHeader.replace(/^Bearer\s+/i, '');

    let userId: string | null = null;
    if (token) {
      try {
        const decoded = JSON.parse(Buffer.from(token, 'base64').toString('utf-8'));
        userId = decoded.userId;
      } catch {
        userId = null;
      }
    }

    if (!userId) {
      return NextResponse.json({ success: false, message: "غير مصرح" }, { status: 401 });
    }

    const body = await req.json();
    const { fullName, phone, address, avatarUrl } = body;

    const [user] = await sql`
      UPDATE users
      SET 
        full_name = COALESCE(${fullName || null}, full_name),
        phone = COALESCE(${phone || null}, phone),
        avatar_url = COALESCE(${avatarUrl || null}, avatar_url),
        updated_at = NOW()
      WHERE id = ${userId}
      RETURNING id, email, full_name, phone, status, avatar_url, created_at
    `;

    if (!user) {
      return NextResponse.json({ success: false, message: "المستخدم غير موجود" }, { status: 404 });
    }

    if (address !== undefined) {
      await sql`
        UPDATE customers
        SET notes = ${address}, updated_at = NOW()
        WHERE user_id = ${userId}
      `;
    }

    const isAdmin = checkIsAdmin(user.email);

    return NextResponse.json({
      success: true,
      message: "تم تحديث البيانات بنجاح",
      data: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        phone: user.phone,
        status: user.status,
        isAdmin,
        avatarUrl: user.avatar_url || null,
        address: address || "",
        createdAt: new Date(user.created_at).toISOString(),
        recentOrders: [],
      },
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
