import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { randomUUID } from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      idempotencyKey = `IDEM-${randomUUID()}`,
      cartToken,
      customerName,
      customerPhone,
      fulfillmentType = "DELIVERY",
      deliveryZoneId,
      streetAddress,
      buildingNumber,
      floorDoor,
      landmark,
      timeSlotId,
      paymentMethod = "CASH",
      customerNotes,
      couponCode,
    } = body;

    // Check idempotency
    const [existing] = await sql`SELECT * FROM orders WHERE idempotency_key = ${idempotencyKey} LIMIT 1`;
    if (existing) {
      return NextResponse.json({
        success: true,
        message: "Order already exists",
        data: formatOrderResponse(existing, []),
        timestamp: new Date().toISOString(),
      });
    }

    // Get cart
    const [cart] = await sql`SELECT id FROM carts WHERE cart_token = ${cartToken} LIMIT 1`;
    if (!cart) {
      return NextResponse.json({ success: false, message: "السلة غير موجودة" }, { status: 400 });
    }

    const cartItems = await sql`
      SELECT 
        ci.id,
        ci.product_id,
        ci.variant_id,
        ci.quantity,
        ci.selected_configuration,
        p.name_ar,
        p.base_price::float
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.cart_id = ${cart.id}
    `;

    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json({ success: false, message: "السلة فارغة، لا يمكن إتمام الطلب" }, { status: 400 });
    }

    const subtotal = cartItems.reduce((acc: number, item: any) => acc + (item.base_price * item.quantity), 0);

    let deliveryFee = 0;
    if (fulfillmentType === "DELIVERY") {
      if (deliveryZoneId) {
        const [zone] = await sql`SELECT delivery_fee::float FROM delivery_zones WHERE id = ${deliveryZoneId} LIMIT 1`;
        deliveryFee = zone ? zone.delivery_fee : 35;
      } else {
        deliveryFee = 35;
      }
    }

    let discountAmount = 0;
    if (couponCode) {
      const [coupon] = await sql`
        SELECT id, discount_type, discount_value::float, min_order_amount::float
        FROM coupons
        WHERE UPPER(code) = UPPER(${couponCode}) AND is_active = true
        LIMIT 1
      `;
      if (coupon && (!coupon.min_order_amount || subtotal >= coupon.min_order_amount)) {
        if (coupon.discount_type === 'PERCENTAGE') {
          discountAmount = Math.round((subtotal * coupon.discount_value) / 100);
        } else {
          discountAmount = Math.min(subtotal, coupon.discount_value);
        }
        await sql`UPDATE coupons SET uses_count = uses_count + 1 WHERE id = ${coupon.id}`;
      }
    }

    const totalAmount = Math.max(0, subtotal + deliveryFee - discountAmount);

    // Get time slot
    let scheduledDate = new Date().toISOString().slice(0, 10);
    let scheduledTimeRange = "12:00 - 15:00";
    if (timeSlotId) {
      const [slot] = await sql`
        SELECT slot_date, start_time, end_time
        FROM time_slots
        WHERE id = ${timeSlotId}
        LIMIT 1
      `;
      if (slot) {
        if (slot.slot_date) scheduledDate = new Date(slot.slot_date).toISOString().slice(0, 10);
        scheduledTimeRange = `${slot.start_time?.slice(0, 5)} - ${slot.end_time?.slice(0, 5)}`;
      }
    }

    const [branch] = await sql`SELECT id FROM branches WHERE is_active = true LIMIT 1`;
    const branchId = branch ? branch.id : '2d0be48c-7fe8-4b42-9df8-865931fe9e77';

    const orderId = randomUUID();
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    const rand = Math.floor(1000 + Math.random() * 9000);
    const publicOrderNumber = `LC-${dateStr}-${rand}`;
    const trackingToken = randomUUID().replace(/-/g, '');

    const addressSnapshot = JSON.stringify({
      streetAddress: streetAddress || "",
      buildingNumber: buildingNumber || "",
      floorDoor: floorDoor || "",
      landmark: landmark || "",
      zoneId: deliveryZoneId || null,
    });

    await sql`
      INSERT INTO orders (
        id, public_order_number, tracking_token, idempotency_key, customer_name, customer_phone,
        fulfillment_type, branch_id, delivery_zone_id, delivery_address_snapshot,
        time_slot_id, scheduled_for_date, scheduled_for_time_range,
        subtotal, discount_amount, delivery_fee, total_amount, currency,
        order_status, payment_status, payment_method, customer_notes,
        created_at, updated_at
      ) VALUES (
        ${orderId}, ${publicOrderNumber}, ${trackingToken}, ${idempotencyKey}, ${customerName}, ${customerPhone},
        ${fulfillmentType}, ${branchId}, ${deliveryZoneId || null}, ${addressSnapshot}::jsonb,
        ${timeSlotId || null}, ${scheduledDate}, ${scheduledTimeRange},
        ${subtotal}, ${discountAmount}, ${deliveryFee}, ${totalAmount}, 'EGP',
        'RECEIVED', 'PENDING', ${paymentMethod}, ${customerNotes || null},
        NOW(), NOW()
      )
    `;

    // Insert order items
    const insertedItems: any[] = [];
    for (const item of cartItems) {
      const itemId = randomUUID();
      const lineTotal = item.base_price * item.quantity;
      await sql`
        INSERT INTO order_items (
          id, order_id, product_id, variant_id, product_name_snapshot,
          unit_price_snapshot, quantity, line_total,
          options_snapshot, addons_snapshot, custom_details_snapshot
        ) VALUES (
          ${itemId}, ${orderId}, ${item.product_id}, ${item.variant_id || null}, ${item.name_ar},
          ${item.base_price}, ${item.quantity}, ${lineTotal},
          ${item.selected_configuration || '{}'}::jsonb, '{}'::jsonb, '{}'::jsonb
        )
      `;
      insertedItems.push({
        id: itemId,
        productName: item.name_ar,
        productNameAr: item.name_ar,
        unitPrice: item.base_price,
        quantity: item.quantity,
        lineTotal,
      });
    }

    // Insert initial order history
    await sql`
      INSERT INTO order_status_history (id, order_id, previous_status, new_status, note, created_at)
      VALUES (${randomUUID()}, ${orderId}, NULL, 'RECEIVED', 'تم استلام وتأكيد الطلب بنجاح', NOW())
    `;

    // Clear cart
    await sql`DELETE FROM cart_items WHERE cart_id = ${cart.id}`;

    const orderData = {
      id: orderId,
      publicOrderNumber,
      trackingToken,
      orderStatus: "RECEIVED",
      orderStatusLabelAr: "تم استلام الطلب",
      paymentStatus: "PENDING",
      paymentStatusLabelAr: "في انتظار الدفع",
      paymentMethod,
      paymentMethodLabelAr: paymentMethod === 'CASH' ? "الدفع عند الاستلام" : "تحويل محفظة إلكترونية",
      fulfillmentType,
      fulfillmentTypeLabelAr: fulfillmentType === 'PICKUP' ? "استلام من الفرع" : "توصيل للعنوان",
      scheduledForDate: scheduledDate,
      scheduledForTimeRange: scheduledTimeRange,
      customerName,
      customerPhone,
      subtotal,
      discountAmount,
      deliveryFee,
      totalAmount,
      currency: "EGP",
      deliveryAddressSnapshot: addressSnapshot,
      customerNotes,
      items: insertedItems,
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      message: "تم إنشاء الطلب بنجاح",
      data: orderData,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

function formatOrderResponse(row: any, items: any[]) {
  return {
    id: row.id,
    publicOrderNumber: row.public_order_number,
    trackingToken: row.tracking_token,
    orderStatus: row.order_status,
    orderStatusLabelAr: getStatusLabel(row.order_status),
    paymentStatus: row.payment_status,
    paymentStatusLabelAr: getPaymentStatusLabel(row.payment_status),
    paymentMethod: row.payment_method,
    paymentMethodLabelAr: getPaymentMethodLabel(row.payment_method),
    fulfillmentType: row.fulfillment_type,
    fulfillmentTypeLabelAr: row.fulfillment_type === 'PICKUP' ? "استلام من الفرع" : "توصيل للعنوان",
    scheduledForDate: row.scheduled_for_date ? new Date(row.scheduled_for_date).toISOString().slice(0, 10) : "",
    scheduledForTimeRange: row.scheduled_for_time_range || "",
    customerName: row.customer_name,
    customerPhone: row.customer_phone,
    subtotal: Number(row.subtotal),
    discountAmount: Number(row.discount_amount),
    deliveryFee: Number(row.delivery_fee),
    totalAmount: Number(row.total_amount),
    currency: row.currency || "EGP",
    deliveryAddressSnapshot: typeof row.delivery_address_snapshot === 'string' ? row.delivery_address_snapshot : JSON.stringify(row.delivery_address_snapshot),
    customerNotes: row.customer_notes,
    items,
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
  };
}

function getStatusLabel(status: string) {
  const map: Record<string, string> = {
    RECEIVED: "تم استلام الطلب",
    CONFIRMED: "مؤكد",
    PREPARING: "قيد التجهيز",
    OUT_FOR_DELIVERY: "جاري التوصيل",
    READY_FOR_PICKUP: "جاهز للاستلام",
    DELIVERED: "تم التوصيل",
    CANCELLED: "ملغي",
  };
  return map[status] || status;
}

function getPaymentStatusLabel(status: string) {
  const map: Record<string, string> = {
    PENDING: "في انتظار الدفع",
    UNPAID: "غير مدفوع",
    PAID: "تم الدفع",
    FAILED: "فشل الدفع",
  };
  return map[status] || status;
}

function getPaymentMethodLabel(method: string) {
  const map: Record<string, string> = {
    CASH: "الدفع عند الاستلام",
    MANUAL_TRANSFER: "تحويل محفظة إلكترونية (فودافون كاش / إنستاباي)",
    CARD_ONLINE: "بطاقة بنكية",
  };
  return map[method] || method;
}
