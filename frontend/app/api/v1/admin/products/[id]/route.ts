export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();
    const {
      categoryId,
      nameAr,
      nameEn,
      slug,
      descriptionAr,
      basePrice,
      productType,
      sellingUnit,
      prepLeadHours,
      stockQuantity,
      isPreOrder,
      isActive,
      isFeatured,
      isCustomizable,
      displayOrder,
      primaryImageUrl,
      galleryImages,
      images,
      variants,
      options,
    } = body;

    const [product] = await sql`
      UPDATE products
      SET 
        category_id = COALESCE(${categoryId || null}, category_id),
        name_ar = COALESCE(${nameAr || null}, name_ar),
        name_en = COALESCE(${nameEn || null}, name_en),
        slug = COALESCE(${slug || null}, slug),
        description_ar = COALESCE(${descriptionAr || null}, description_ar),
        base_price = COALESCE(${basePrice || null}, base_price),
        product_type = COALESCE(${productType || null}, product_type),
        selling_unit = COALESCE(${sellingUnit || null}, selling_unit),
        prep_lead_hours = COALESCE(${prepLeadHours || null}, prep_lead_hours),
        stock_quantity = COALESCE(${stockQuantity || null}, stock_quantity),
        is_pre_order = COALESCE(${isPreOrder !== undefined ? isPreOrder : null}, is_pre_order),
        is_active = COALESCE(${isActive !== undefined ? isActive : null}, is_active),
        is_featured = COALESCE(${isFeatured !== undefined ? isFeatured : null}, is_featured),
        is_customizable = COALESCE(${isCustomizable !== undefined ? isCustomizable : null}, is_customizable),
        display_order = COALESCE(${displayOrder || null}, display_order),
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;

    if (primaryImageUrl) {
      try {
        await sql`DELETE FROM product_images WHERE product_id = ${id} AND is_primary = true`;
        await sql`
          INSERT INTO product_images (id, product_id, storage_key, public_url, is_primary, display_order, created_at)
          VALUES (gen_random_uuid(), ${id}, ${primaryImageUrl}, ${primaryImageUrl}, true, 0, NOW())
        `;
      } catch {
        await sql`
          INSERT INTO product_images (id, product_id, storage_key, is_primary, display_order, created_at)
          VALUES (gen_random_uuid(), ${id}, ${primaryImageUrl}, true, 0, NOW())
        `;
      }
    }

    if (galleryImages !== undefined || images !== undefined) {
      const extraImages = Array.isArray(galleryImages) && galleryImages.length > 0
        ? galleryImages
        : (Array.isArray(images) ? images.filter((img: string) => img !== primaryImageUrl) : []);

      await sql`DELETE FROM product_images WHERE product_id = ${id} AND is_primary = false`;

      if (extraImages.length > 0) {
        for (let i = 0; i < extraImages.length; i++) {
          const gUrl = extraImages[i];
          if (!gUrl || !gUrl.trim()) continue;
          try {
            await sql`
              INSERT INTO product_images (id, product_id, storage_key, public_url, is_primary, display_order, created_at)
              VALUES (gen_random_uuid(), ${id}, ${gUrl}, ${gUrl}, false, ${i + 1}, NOW())
            `;
          } catch {
            await sql`
              INSERT INTO product_images (id, product_id, storage_key, is_primary, display_order, created_at)
              VALUES (gen_random_uuid(), ${id}, ${gUrl}, false, ${i + 1}, NOW())
            `;
          }
        }
      }
    }

    if (Array.isArray(variants)) {
      await sql`DELETE FROM product_variants WHERE product_id = ${id}`;
      for (let i = 0; i < variants.length; i++) {
        const v = variants[i];
        if (!v.nameAr || !v.nameAr.trim()) continue;
        const vPrice = v.priceOverride !== undefined && v.priceOverride !== null ? Number(v.priceOverride) : Number(product.base_price);
        await sql`
          INSERT INTO product_variants (
            id, product_id, name_ar, name_en, sku, price_override, is_active, display_order, image_url, created_at
          ) VALUES (
            gen_random_uuid(), ${id}, ${v.nameAr.trim()}, ${v.nameEn?.trim() || null}, ${v.sku || `${product.slug}-var-${i+1}`},
            ${vPrice}, ${v.isActive !== false}, ${i + 1}, ${v.imageUrl || null}, NOW()
          )
        `;
      }
    }

    if (Array.isArray(options)) {
      const existingPogs = await sql`SELECT option_group_id FROM product_option_groups WHERE product_id = ${id}`;
      let optionGroupId: string | null = null;
      if (existingPogs.length > 0) {
        optionGroupId = existingPogs[0].option_group_id;
        await sql`DELETE FROM option_values WHERE option_group_id = ${optionGroupId}`;
      } else if (options.length > 0) {
        const [newOg] = await sql`
          INSERT INTO option_groups (id, name_ar, name_en, selection_type, is_required, min_selections, max_selections, created_at)
          VALUES (gen_random_uuid(), 'النكهة والحشوة', 'Flavor & Filling', 'SINGLE', false, 0, 1, NOW())
          RETURNING id
        `;
        optionGroupId = newOg.id;
        await sql`
          INSERT INTO product_option_groups (product_id, option_group_id, display_order)
          VALUES (${id}, ${optionGroupId}, 1)
        `;
      }
      if (optionGroupId) {
        for (let i = 0; i < options.length; i++) {
          const opt = options[i];
          if (!opt.nameAr || !opt.nameAr.trim()) continue;
          await sql`
            INSERT INTO option_values (id, option_group_id, name_ar, name_en, price_modifier, is_active, display_order, image_url, created_at)
            VALUES (gen_random_uuid(), ${optionGroupId}, ${opt.nameAr.trim()}, ${opt.nameEn || null}, ${Number(opt.priceDelta || 0)}, true, ${i + 1}, ${opt.imageUrl || null}, NOW())
          `;
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: "تم تحديث المنتج بنجاح",
      data: {
        id: product.id,
        categoryId: product.category_id,
        slug: product.slug,
        nameAr: product.name_ar,
        nameEn: product.name_en,
        descriptionAr: product.description_ar,
        basePrice: Number(product.base_price),
        prepLeadHours: product.prep_lead_hours,
        stockQuantity: product.stock_quantity,
        isPreOrder: product.is_pre_order,
        isActive: product.is_active,
        isFeatured: product.is_featured,
        isCustomizable: product.is_customizable,
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
    await sql`DELETE FROM product_images WHERE product_id = ${id}`;
    await sql`DELETE FROM products WHERE id = ${id}`;
    return NextResponse.json({
      success: true,
      message: "تم حذف المنتج بنجاح",
      data: null,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
