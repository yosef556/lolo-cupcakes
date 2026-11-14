export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { randomUUID } from 'crypto';

export async function GET() {
  try {
    const reviews = await sql`
      SELECT 
        r.id,
        r.product_id AS "productId",
        p.name_ar AS "productNameAr",
        r.customer_name AS "customerName",
        r.rating,
        r.comment,
        r.created_at AS "createdAt"
      FROM product_reviews r
      LEFT JOIN products p ON r.product_id = p.id
      ORDER BY r.created_at DESC
    `;

    const mapped = reviews.map((r: any) => ({
      ...r,
      createdAt: new Date(r.createdAt).toISOString(),
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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { productId, customerName, rating = 5, comment = "" } = body;

    const id = randomUUID();
    const [review] = await sql`
      INSERT INTO product_reviews (id, product_id, customer_name, rating, comment, created_at)
      VALUES (${id}, ${productId || null}, ${customerName}, ${rating}, ${comment}, NOW())
      RETURNING id, product_id AS "productId", customer_name AS "customerName", rating, comment, created_at AS "createdAt"
    `;

    return NextResponse.json({
      success: true,
      message: "تم إضافة التقييم بنجاح",
      data: {
        ...review,
        createdAt: new Date(review.createdAt).toISOString(),
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
