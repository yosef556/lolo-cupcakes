import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = params.slug;

    const [product] = await sql`
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
      WHERE p.slug = ${slug} OR p.id::text = ${slug}
      LIMIT 1
    `;

    if (!product) {
      return NextResponse.json({ success: false, message: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Operation successful",
      data: {
        ...product,
        optionGroups: [],
        addons: [],
        variants: [],
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
