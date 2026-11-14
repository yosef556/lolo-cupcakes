export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { randomUUID } from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      categoryId,
      nameAr,
      nameEn,
      slug,
      descriptionAr,
      basePrice,
      productType = "CAKE",
      sellingUnit = "PIECE",
      prepLeadHours = 2,
      stockQuantity = 50,
      isPreOrder = false,
      isActive = true,
      isFeatured = false,
      isCustomizable = false,
      displayOrder = 1,
      primaryImageUrl,
      galleryImages = [],
      images = [],
      variants,
      options,
    } = body;

    // Ensure slug is unique to prevent duplicate key constraint errors
    let finalSlug = (slug || nameAr || 'product')
      .trim()
      .toLowerCase()
      .replace(/[\s/\\?#%&]+/g, '-');
    const existing = await sql`SELECT id FROM products WHERE slug = ${finalSlug} LIMIT 1`;
    if (existing.length > 0) {
      finalSlug = `${finalSlug}-${Date.now().toString().slice(-4)}`;
    }

    const id = randomUUID();
    const [product] = await sql`
      INSERT INTO products (
        id, category_id, slug, name_ar, name_en, description_ar,
        product_type, selling_unit, base_price, prep_lead_hours,
        stock_quantity, is_pre_order, is_active, is_featured, is_customizable,
        display_order, created_at, updated_at
      ) VALUES (
        ${id}, ${categoryId}, ${finalSlug}, ${nameAr}, ${nameEn || null}, ${descriptionAr || null},
        ${productType}, ${sellingUnit}, ${basePrice}, ${prepLeadHours},
        ${stockQuantity}, ${isPreOrder}, ${isActive}, ${isFeatured}, ${isCustomizable},
        ${displayOrder}, NOW(), NOW()
      )
      RETURNING *
    `;

    if (primaryImageUrl) {
      try {
        await sql`
          INSERT INTO product_images (id, product_id, storage_key, public_url, is_primary, display_order, created_at)
          VALUES (${randomUUID()}, ${id}, ${primaryImageUrl}, ${primaryImageUrl}, true, 0, NOW())
        `;
      } catch {
        await sql`
          INSERT INTO product_images (id, product_id, storage_key, is_primary, display_order, created_at)
          VALUES (${randomUUID()}, ${id}, ${primaryImageUrl}, true, 0, NOW())
        `;
      }
    }

    const extraImages = Array.isArray(galleryImages) && galleryImages.length > 0 
      ? galleryImages 
      : (Array.isArray(images) ? images.filter((img: string) => img !== primaryImageUrl) : []);
    
    if (extraImages.length > 0) {
      for (let i = 0; i < extraImages.length; i++) {
        const gUrl = extraImages[i];
        if (!gUrl || !gUrl.trim()) continue;
        try {
          await sql`
            INSERT INTO product_images (id, product_id, storage_key, public_url, is_primary, display_order, created_at)
            VALUES (${randomUUID()}, ${id}, ${gUrl}, ${gUrl}, false, ${i + 1}, NOW())
          `;
        } catch {
          await sql`
            INSERT INTO product_images (id, product_id, storage_key, is_primary, display_order, created_at)
            VALUES (${randomUUID()}, ${id}, ${gUrl}, false, ${i + 1}, NOW())
          `;
        }
      }
    }

    if (Array.isArray(variants)) {
      for (let i = 0; i < variants.length; i++) {
        const v = variants[i];
        if (!v.nameAr || !v.nameAr.trim()) continue;
        const vPrice = v.priceOverride !== undefined && v.priceOverride !== null ? Number(v.priceOverride) : Number(basePrice);
        await sql`
          INSERT INTO product_variants (
            id, product_id, name_ar, name_en, sku, price_override, is_active, display_order, image_url, created_at
          ) VALUES (
            gen_random_uuid(), ${id}, ${v.nameAr.trim()}, ${v.nameEn?.trim() || null}, ${v.sku || `${finalSlug}-var-${i+1}`},
            ${vPrice}, ${v.isActive !== false}, ${i + 1}, ${v.imageUrl || null}, NOW()
          )
        `;
      }
    }

    if (Array.isArray(options) && options.length > 0) {
      const [newOg] = await sql`
        INSERT INTO option_groups (id, name_ar, name_en, selection_type, is_required, min_selections, max_selections, created_at)
        VALUES (gen_random_uuid(), 'النكهة والحشوة', 'Flavor & Filling', 'SINGLE', false, 0, 1, NOW())
        RETURNING id
      `;
      await sql`
        INSERT INTO product_option_groups (product_id, option_group_id, display_order)
        VALUES (${id}, ${newOg.id}, 1)
      `;
      for (let i = 0; i < options.length; i++) {
        const opt = options[i];
        if (!opt.nameAr || !opt.nameAr.trim()) continue;
        await sql`
          INSERT INTO option_values (id, option_group_id, name_ar, name_en, price_modifier, is_active, display_order, image_url, created_at)
          VALUES (gen_random_uuid(), ${newOg.id}, ${opt.nameAr.trim()}, ${opt.nameEn || null}, ${Number(opt.priceDelta || 0)}, true, ${i + 1}, ${opt.imageUrl || null}, NOW())
        `;
      }
    }

    return NextResponse.json({
      success: true,
      message: "تم إضافة المنتج بنجاح",
      data: {
        id: product.id,
        categoryId: product.category_id,
        slug: product.slug,
        nameAr: product.name_ar,
        nameEn: product.name_en,
        descriptionAr: product.description_ar,
        basePrice: Number(product.base_price),
        leadTimeHours: product.prep_lead_hours,
        prepLeadHours: product.prep_lead_hours,
        stockQuantity: product.stock_quantity,
        isPreOrder: product.is_pre_order,
        isActive: product.is_active,
        isFeatured: product.is_featured,
        isCustomizable: product.is_customizable,
        primaryImageUrl: primaryImageUrl || null,
        optionGroups: [],
        addons: [],
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
