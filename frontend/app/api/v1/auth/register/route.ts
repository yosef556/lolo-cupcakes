import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fullName, email, phone, password, address } = body;

    if (!fullName || !email || !password) {
      return NextResponse.json({ success: false, message: "يرجى تعبئة كافة الحقول المطلوبة" }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const [existing] = await sql`
      SELECT id FROM users WHERE LOWER(email) = ${cleanEmail} OR phone = ${phone} LIMIT 1
    `;

    if (existing) {
      return NextResponse.json({ success: false, message: "البريد الإلكتروني أو رقم الهاتف مسجل بالفعل" }, { status: 400 });
    }

    const userId = randomUUID();
    const passwordHash = await bcrypt.hash(password, 10);

    await sql`
      INSERT INTO users (id, email, password_hash, phone, full_name, status, created_at, updated_at)
      VALUES (${userId}, ${cleanEmail}, ${passwordHash}, ${phone || null}, ${fullName}, 'ACTIVE', NOW(), NOW())
    `;

    // Also register customer record if customer table exists
    const customerId = randomUUID();
    await sql`
      INSERT INTO customers (id, user_id, full_name, phone, email, notes, created_at, updated_at)
      VALUES (${customerId}, ${userId}, ${fullName}, ${phone || null}, ${cleanEmail}, ${address || ''}, NOW(), NOW())
      ON CONFLICT DO NOTHING
    `;

    const isAdmin = cleanEmail === 'admin@lolocupcakes.com' || cleanEmail.startsWith('admin@');
    const token = Buffer.from(JSON.stringify({ userId, email: cleanEmail, exp: Date.now() + 7 * 24 * 60 * 60 * 1000 })).toString('base64');

    return NextResponse.json({
      success: true,
      message: "تم إنشاء الحساب بنجاح! أهلاً بك في لولو كب كيك 🧁",
      data: {
        token,
        user: {
          id: userId,
          fullName,
          email: cleanEmail,
          phone,
          status: "ACTIVE",
          isAdmin,
          avatarUrl: null,
        },
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
