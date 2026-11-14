export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { randomUUID } from 'crypto';

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    const [product] = await sql`
      SELECT id FROM products WHERE id::text = ${slug} OR slug = ${slug} LIMIT 1
    `;

    if (!product) {
      return NextResponse.json({ success: true, message: "No product found", data: [] });
    }

    const reviews = await sql`
      SELECT id, product_id AS "productId", user_id AS "userId", customer_name AS "customerName", rating, comment, created_at AS "createdAt"
      FROM product_reviews
      WHERE product_id = ${product.id}
      ORDER BY created_at DESC
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

export async function POST(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const body = await req.json();
    const { customerName, rating = 5, comment = "", userId } = body;

    const [product] = await sql`
      SELECT id FROM products WHERE id::text = ${slug} OR slug = ${slug} LIMIT 1
    `;

    if (!product) {
      return NextResponse.json({ success: false, message: "المنتج غير موجود" }, { status: 404 });
    }

    const id = randomUUID();
    const [review] = await sql`
      INSERT INTO product_reviews (id, product_id, user_id, customer_name, rating, comment, created_at)
      VALUES (${id}, ${product.id}, ${userId || null}, ${customerName}, ${rating}, ${comment}, NOW())
      RETURNING id, product_id AS "productId", user_id AS "userId", customer_name AS "customerName", rating, comment, created_at AS "createdAt"
    `;

    return NextResponse.json({
      success: true,
      message: "شكراً لك! تم إضافة تقييمك بنجاح ⭐",
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
