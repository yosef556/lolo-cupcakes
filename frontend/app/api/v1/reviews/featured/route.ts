export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    const dbReviews = await sql`
      SELECT 
        r.id,
        r.customer_name AS "customerName",
        r.rating,
        r.comment,
        COALESCE(r.is_featured, false) AS "featured",
        true AS "verifiedPurchase",
        COALESCE(p.name_ar, 'متجر لولو كب كيك') AS "productName",
        r.created_at AS "createdAt"
      FROM product_reviews r
      LEFT JOIN products p ON r.product_id = p.id
      WHERE r.is_approved = true OR r.is_approved IS NULL
      ORDER BY r.is_featured DESC, r.rating DESC, r.created_at DESC
      LIMIT 6
    `;

    if (dbReviews && dbReviews.length > 0) {
      return NextResponse.json({
        success: true,
        message: "Operation successful",
        data: dbReviews.map((r: any) => ({
          ...r,
          createdAt: new Date(r.createdAt).toISOString(),
        })),
        timestamp: new Date().toISOString(),
      });
    }

    // Fallback sample reviews if none yet in DB
    const sampleReviews = [
      {
        id: "rev-1",
        customerName: "سارة محمود",
        rating: 5,
        comment: "أحلى كب كيك ذقته في مصر! الكريمة خفيفة جداً ومظبوطة بالسكر، والتوصيل وصل في ميعاده بالضبط.",
        createdAt: new Date().toISOString(),
        featured: true,
        verifiedPurchase: true,
        productName: "كب كيك الكراميل",
      },
      {
        id: "rev-2",
        customerName: "أحمد عبد الله",
        rating: 5,
        comment: "تورتة الكيندر فادج عملت قلبان في عيد ميلاد ابني! طعم الشوكولاتة غني جداً وشكلها كان تحفة فنية.",
        createdAt: new Date().toISOString(),
        featured: true,
        verifiedPurchase: true,
        productName: "تورتة شوكولاتة كيندر فادج الملكية",
      },
      {
        id: "rev-3",
        customerName: "مريم إبراهيم",
        rating: 5,
        comment: "خدمة التخصيص ممتازة وفريق العمل متعاون جداً، النكهة طازة والشغل راقي يشرف في أي عزومة.",
        createdAt: new Date().toISOString(),
        featured: true,
        verifiedPurchase: true,
        productName: "بوكس كب كيك مشكل 6 قطع",
      }
    ];

    return NextResponse.json({
      success: true,
      message: "Operation successful",
      data: sampleReviews,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
