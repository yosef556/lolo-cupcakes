export const dynamic = 'force-dynamic';
export const revalidate = 0;

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
        p.product_type AS "productType",
        p.selling_unit AS "sellingUnit",
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

    const variants = await sql`
      SELECT 
        id, 
        name_ar AS "nameAr", 
        name_en AS "nameEn", 
        sku, 
        price_override::float AS "priceOverride", 
        is_active AS "isActive", 
        display_order AS "displayOrder" 
      FROM product_variants 
      WHERE product_id = ${product.id} AND is_active = true 
      ORDER BY display_order ASC
    `;

    const optionGroupsRows = await sql`
      SELECT 
        og.id, 
        og.name_ar AS "nameAr", 
        og.name_en AS "nameEn", 
        og.selection_type AS "selectionType", 
        og.is_required AS "isRequired", 
        og.min_selections AS "minSelections", 
        og.max_selections AS "maxSelections" 
      FROM option_groups og 
      JOIN product_option_groups pog ON pog.option_group_id = og.id 
      WHERE pog.product_id = ${product.id}
      ORDER BY pog.display_order ASC
    `;

    const optionGroups = [];
    for (const og of optionGroupsRows) {
      const values = await sql`
        SELECT 
          id, 
          name_ar AS "nameAr", 
          name_en AS "nameEn", 
          price_modifier::float AS "priceDelta", 
          is_active AS "isActive", 
          display_order AS "displayOrder" 
        FROM option_values 
        WHERE option_group_id = ${og.id} AND is_active = true 
        ORDER BY display_order ASC
      `;
      optionGroups.push({
        id: og.id,
        nameAr: og.nameAr,
        isRequired: Boolean(og.isRequired),
        allowMultiple: og.selectionType === 'MULTIPLE',
        values: values.map((v: any) => ({
          id: v.id,
          nameAr: v.nameAr,
          priceDelta: Number(v.priceDelta || 0),
          isDefault: false,
        })),
      });
    }

    return NextResponse.json({
      success: true,
      message: "Operation successful",
      data: {
        ...product,
        optionGroups,
        addons: [],
        variants,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
