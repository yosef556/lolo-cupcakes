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

    const id = randomUUID();
    const [product] = await sql`
      INSERT INTO products (
        id, category_id, slug, name_ar, name_en, description_ar,
        product_type, selling_unit, base_price, prep_lead_hours,
        stock_quantity, is_pre_order, is_active, is_featured, is_customizable,
        display_order, created_at, updated_at
      ) VALUES (
        ${id}, ${categoryId}, ${slug}, ${nameAr}, ${nameEn || null}, ${descriptionAr || null},
        'CUPCAKE', 'PIECE', ${basePrice}, ${prepLeadHours},
        ${stockQuantity}, ${isPreOrder}, ${isActive}, ${isFeatured}, ${isCustomizable},
        ${displayOrder}, NOW(), NOW()
      )
      RETURNING *
    `;

    if (primaryImageUrl) {
      await sql`
        INSERT INTO product_images (id, product_id, storage_key, public_url, is_primary, display_order, created_at)
        VALUES (${randomUUID()}, ${id}, ${primaryImageUrl}, ${primaryImageUrl}, true, 1, NOW())
      `;
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
