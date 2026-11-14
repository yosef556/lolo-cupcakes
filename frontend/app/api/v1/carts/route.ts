import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { randomUUID } from 'crypto';

export async function POST() {
  try {
    const token = 'cart_' + randomUUID().replace(/-/g, '');
    const id = randomUUID();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    await sql`
      INSERT INTO carts (id, cart_token, expires_at, created_at, updated_at)
      VALUES (${id}, ${token}, ${expiresAt}, NOW(), NOW())
    `;

    return NextResponse.json({
      success: true,
      message: "Cart created",
      data: {
        cartToken: token,
        items: [],
        totalQuantity: 0,
        subtotal: 0,
        currency: "EGP",
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
