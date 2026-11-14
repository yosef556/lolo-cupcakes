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
    const { isApproved, isFeatured } = body;

    const [existing] = await sql`SELECT * FROM product_reviews WHERE id = ${id} LIMIT 1`;
    if (!existing) {
      return NextResponse.json({ success: false, message: "لم يتم العثور على التقييم" }, { status: 404 });
    }

    const nextApproved = isApproved !== undefined ? Boolean(isApproved) : existing.is_approved;
    const nextFeatured = isFeatured !== undefined ? Boolean(isFeatured) : existing.is_featured;
    const nextStatus = nextApproved ? 'APPROVED' : 'HIDDEN';

    const [updated] = await sql`
      UPDATE product_reviews
      SET 
        is_approved = ${nextApproved},
        is_featured = ${nextFeatured},
        status = ${nextStatus}
      WHERE id = ${id}
      RETURNING id, product_id AS "productId", customer_name AS "customerName", rating, comment, is_approved AS "isApproved", is_featured AS "isFeatured", status, created_at AS "createdAt"
    `;

    return NextResponse.json({
      success: true,
      message: nextApproved ? "تم إظهار التقييم على واجهة المتجر بنجاح ⭐" : "تم إخفاء التقييم من واجهة المتجر 👁️‍🗨️",
      data: {
        ...updated,
        createdAt: new Date(updated.createdAt).toISOString(),
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    await sql`DELETE FROM product_reviews WHERE id = ${id}`;
    return NextResponse.json({
      success: true,
      message: "تم حذف التقييم بنجاح",
      data: null,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

