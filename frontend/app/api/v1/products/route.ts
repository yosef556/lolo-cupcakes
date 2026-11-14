export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const categorySlug = searchParams.get('category');
    const search = searchParams.get('search');
    const includeInactive = searchParams.get('includeInactive') !== 'false';

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
      WHERE (${includeInactive} = true OR p.is_active = true)
      ORDER BY p.display_order ASC, p.created_at DESC
    `;

    const allVariants = await sql`
      SELECT 
        id, 
        product_id AS "productId",
        name_ar AS "nameAr", 
        name_en AS "nameEn", 
        sku, 
        price_override::float AS "priceOverride", 
        is_active AS "isActive", 
        display_order AS "displayOrder",
        image_url AS "imageUrl"
      FROM product_variants 
      WHERE is_active = true 
      ORDER BY display_order ASC
    `;

    const allProductImages = await sql`
      SELECT 
        product_id AS "productId", 
        COALESCE(public_url, storage_key) AS "url", 
        is_primary AS "isPrimary", 
        display_order AS "displayOrder"
      FROM product_images
      ORDER BY display_order ASC
    `;

    const allPogs = await sql`
      SELECT 
        pog.product_id AS "productId",
        og.id, 
        og.name_ar AS "nameAr", 
        og.name_en AS "nameEn", 
        og.selection_type AS "selectionType", 
        og.is_required AS "isRequired"
      FROM product_option_groups pog
      JOIN option_groups og ON og.id = pog.option_group_id
      ORDER BY pog.display_order ASC
    `;

    const allOptionValues = await sql`
      SELECT 
        id, 
        option_group_id AS "optionGroupId", 
        name_ar AS "nameAr", 
        name_en AS "nameEn", 
        price_modifier::float AS "priceDelta", 
        is_active AS "isActive", 
        display_order AS "displayOrder",
        image_url AS "imageUrl"
      FROM option_values 
      WHERE is_active = true 
      ORDER BY display_order ASC
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
        content: filtered.map((p: any) => {
          const prodVariants = allVariants.filter((v: any) => v.productId === p.id);
          const prodPogs = allPogs.filter((g: any) => g.productId === p.id);
          const prodImagesRows = allProductImages
            .filter((img: any) => img.productId === p.id)
            .sort((a: any, b: any) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0));
          const prodImages = prodImagesRows.map((img: any) => img.url).filter(Boolean);
          if (prodImages.length === 0 && p.primaryImageUrl) {
            prodImages.push(p.primaryImageUrl);
          }

          const prodOptionGroups = prodPogs.map((og: any) => ({
            id: og.id,
            nameAr: og.nameAr,
            isRequired: Boolean(og.isRequired),
            allowMultiple: og.selectionType === 'MULTIPLE',
            values: allOptionValues.filter((ov: any) => ov.optionGroupId === og.id).map((v: any) => ({
              id: v.id,
              nameAr: v.nameAr,
              priceDelta: Number(v.priceDelta || 0),
              imageUrl: v.imageUrl || null,
              isDefault: false,
            })),
          }));
          return {
            ...p,
            images: prodImages,
            galleryImages: prodImages.length > 1 ? prodImages.slice(1) : [],
            variants: prodVariants,
            optionGroups: prodOptionGroups,
            addons: [],
          };
        }),
        totalElements: filtered.length,
        totalPages: 1,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
