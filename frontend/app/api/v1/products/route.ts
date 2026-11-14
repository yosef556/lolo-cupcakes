import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const categorySlug = searchParams.get('category');
    const search = searchParams.get('search');

    const products = await sql`
      SELECT 
        p.id,
        p.category_id AS "categoryId",
        p.slug,
        p.name_ar AS "nameAr",
        p.name_en AS "nameEn",
        p.description_ar AS "descriptionAr",
        p.base_price::float AS "basePrice",
        p.prep_lead_hours AS "leadTimeHours",
        p.prep_lead_hours AS "prepLeadHours",
        p.stock_quantity AS "stockQuantity",
        p.is_pre_order AS "isPreOrder",
        p.is_active AS "isActive",
        p.is_featured AS "isFeatured",
        p.is_customizable AS "isCustomizable",
        c.name_ar AS "categoryNameAr",
        c.slug AS "categorySlug",
        COALESCE(img.storage_key, '/placeholders/cupcake-1.jpg') AS "primaryImageUrl"
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN LATERAL (
        SELECT storage_key FROM product_images WHERE product_id = p.id AND is_primary = true LIMIT 1
      ) img ON true
      WHERE p.is_active = true
      ORDER BY p.display_order ASC, p.created_at DESC
    `;

    let filtered = products;
    if (categorySlug) {
      filtered = filtered.filter((p: any) => p.categorySlug === categorySlug);
    }
    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter((p: any) => 
        (p.nameAr && p.nameAr.toLowerCase().includes(s)) || 
        (p.nameEn && p.nameEn.toLowerCase().includes(s))
      );
    }

    return NextResponse.json({
      success: true,
      message: "Operation successful",
      data: {
        content: filtered.map((p: any) => ({
          ...p,
          optionGroups: [],
          addons: [],
          variants: [],
        })),
        totalElements: filtered.length,
        totalPages: 1,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
