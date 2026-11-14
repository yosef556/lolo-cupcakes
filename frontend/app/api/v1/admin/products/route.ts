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
      prepLeadHours = 2,
      stockQuantity = 50,
      isPreOrder = false,
      isActive = true,
      isFeatured = false,
      isCustomizable = false,
      displayOrder = 1,
      primaryImageUrl,
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
        'CUPCAKE', 'PIECE', ${basePrice}, ${prepLeadHours},
        ${stockQuantity}, ${isPreOrder}, ${isActive}, ${isFeatured}, ${isCustomizable},
        ${displayOrder}, NOW(), NOW()
      )
      RETURNING *
    `;

    if (primaryImageUrl) {
      try {
        await sql`
          INSERT INTO product_images (id, product_id, storage_key, public_url, is_primary, display_order, created_at)
          VALUES (${randomUUID()}, ${id}, ${primaryImageUrl}, ${primaryImageUrl}, true, 1, NOW())
        `;
      } catch {
        await sql`
          INSERT INTO product_images (id, product_id, storage_key, is_primary, display_order, created_at)
          VALUES (${randomUUID()}, ${id}, ${primaryImageUrl}, true, 1, NOW())
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
