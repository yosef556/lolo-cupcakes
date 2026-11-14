import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { randomUUID } from 'crypto';

export async function POST(
  req: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const token = params.token;
    let [cart] = await sql`SELECT id, cart_token FROM carts WHERE cart_token = ${token} LIMIT 1`;
    
    if (!cart) {
      const newId = randomUUID();
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      await sql`
        INSERT INTO carts (id, cart_token, expires_at, created_at, updated_at)
        VALUES (${newId}, ${token}, ${expiresAt}, NOW(), NOW())
      `;
      cart = { id: newId, cart_token: token };
    }

    const body = await req.json();
    const { productId, variantId, quantity = 1, selectedOptionValueIds = [], selectedAddonIds = [], customerNote = "" } = body;

    const itemId = randomUUID();
    const config = JSON.stringify({
      selectedOptionValueIds,
      selectedAddonIds,
      customerNote,
    });

    await sql`
      INSERT INTO cart_items (id, cart_id, product_id, variant_id, quantity, selected_configuration, created_at, updated_at)
      VALUES (${itemId}, ${cart.id}, ${productId}, ${variantId || null}, ${quantity}, ${config}::jsonb, NOW(), NOW())
    `;

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
      message: "Item added to cart",
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
