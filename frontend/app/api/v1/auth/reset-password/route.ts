import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { identifier, newPassword } = body;

    if (!identifier || !newPassword) {
      return NextResponse.json({ success: false, message: "يرجى تقديم كافة الحقول المطلوبة" }, { status: 400 });
    }

    const clean = identifier.trim().toLowerCase();
    const [user] = await sql`
      SELECT id FROM users
      WHERE LOWER(email) = ${clean} OR phone = ${clean}
      LIMIT 1
    `;

    if (!user) {
      return NextResponse.json({ success: false, message: "المستخدم غير موجود" }, { status: 404 });
    }

    const hash = await bcrypt.hash(newPassword, 10);
    await sql`
      UPDATE users
      SET password_hash = ${hash}, updated_at = NOW()
      WHERE id = ${user.id}
    `;

    return NextResponse.json({
      success: true,
      message: "تم تحديث كلمة المرور بنجاح",
      data: "OK",
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
