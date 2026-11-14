import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function DELETE(
  req: NextRequest,
  { params }: { params: { token: string; itemId: string } }
) {
  try {
    const { token, itemId } = params;
    const [cart] = await sql`SELECT id FROM carts WHERE cart_token = ${token} LIMIT 1`;
    if (!cart) {
      return NextResponse.json({ success: false, message: "Cart not found" }, { status: 404 });
    }

    await sql`DELETE FROM cart_items WHERE id = ${itemId} AND cart_id = ${cart.id}`;

    const items = await sql`
      SELECT 
        ci.id,
        ci.product_id AS "productId",
        ci.variant_id AS "variantId",
        ci.quantity,
        ci.selected_configuration AS "selectedConfiguration",
        p.name_ar AS "productNameAr",
        p.slug AS "productSlug",
        p.base_price::float AS "unitPrice"
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.cart_id = ${cart.id}
    `;

    const formattedItems = items.map((i: any) => ({
      id: i.id,
      productId: i.productId,
      productNameAr: i.productNameAr,
      productSlug: i.productSlug,
      variantId: i.variantId,
      unitPrice: i.unitPrice,
      quantity: i.quantity,
      lineTotal: i.unitPrice * i.quantity,
      selectedConfiguration: JSON.stringify(i.selectedConfiguration || {}),
      optionDescriptions: [],
      addonDescriptions: [],
    }));

    const totalQuantity = formattedItems.reduce((acc: number, item: any) => acc + item.quantity, 0);
    const subtotal = formattedItems.reduce((acc: number, item: any) => acc + item.lineTotal, 0);

    return NextResponse.json({
      success: true,
      message: "Item removed from cart",
      data: {
        cartToken: token,
        items: formattedItems,
        totalQuantity,
        subtotal,
        currency: "EGP",
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
