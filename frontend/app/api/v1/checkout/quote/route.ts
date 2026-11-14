export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { cartToken, fulfillmentType = "DELIVERY", deliveryZoneId, couponCode } = body;

    let subtotal = 0;
    if (cartToken) {
      const [cart] = await sql`SELECT id FROM carts WHERE cart_token = ${cartToken} LIMIT 1`;
      if (cart) {
        const items = await sql`
          SELECT ci.quantity, p.base_price::float AS unit_price
          FROM cart_items ci
          JOIN products p ON ci.product_id = p.id
          WHERE ci.cart_id = ${cart.id}
        `;
        subtotal = items.reduce((acc: number, item: any) => acc + (item.unit_price * item.quantity), 0);
      }
    }

    let deliveryFee = 0;
    let deliveryZoneNameAr: string | null = null;

    if (fulfillmentType === "DELIVERY") {
      if (deliveryZoneId) {
        const [zone] = await sql`SELECT name_ar, delivery_fee::float FROM delivery_zones WHERE id = ${deliveryZoneId} LIMIT 1`;
        if (zone) {
          deliveryFee = zone.delivery_fee;
          deliveryZoneNameAr = zone.name_ar;
        } else {
          deliveryFee = 35;
        }
      } else {
        deliveryFee = 35;
      }
    }

    let discountAmount = 0;
    let appliedCouponCode: string | null = null;
    let couponDiscountLabel: string | null = null;

    if (couponCode) {
      const [coupon] = await sql`
        SELECT code, discount_type, discount_value::float, min_order_amount::float
        FROM coupons
        WHERE UPPER(code) = UPPER(${couponCode}) AND is_active = true
        LIMIT 1
      `;
      if (coupon) {
        if (!coupon.min_order_amount || subtotal >= coupon.min_order_amount) {
          appliedCouponCode = coupon.code;
          if (coupon.discount_type === 'PERCENTAGE') {
            discountAmount = Math.round((subtotal * coupon.discount_value) / 100);
            couponDiscountLabel = `خصم ${coupon.discount_value}%`;
          } else {
            discountAmount = Math.min(subtotal, coupon.discount_value);
            couponDiscountLabel = `خصم ${coupon.discount_value} ج.م`;
          }
        }
      }
    }

    const totalAmount = Math.max(0, subtotal + deliveryFee - discountAmount);

    return NextResponse.json({
      success: true,
      message: "Quote calculated",
      data: {
        subtotal,
        deliveryFee,
        discountAmount,
        totalAmount,
        currency: "EGP",
        appliedCouponCode,
        couponDiscountLabel,
        deliveryZoneNameAr,
        fulfillmentType,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
