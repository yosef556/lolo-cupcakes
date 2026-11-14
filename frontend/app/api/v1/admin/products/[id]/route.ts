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
      prepLeadHours,
      stockQuantity,
      isPreOrder,
      isActive,
      isFeatured,
      isCustomizable,
      displayOrder,
      primaryImageUrl,
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
      await sql`
        INSERT INTO product_images (id, product_id, storage_key, public_url, is_primary, display_order, created_at)
        VALUES (gen_random_uuid(), ${id}, ${primaryImageUrl}, ${primaryImageUrl}, true, 1, NOW())
        ON CONFLICT DO NOTHING
      `;
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
