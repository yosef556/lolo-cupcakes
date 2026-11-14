package com.lolocupcakes.orders.dto;

import com.lolocupcakes.orders.model.FulfillmentType;
import com.lolocupcakes.orders.model.PaymentMethod;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

import java.util.UUID;

public record CreateOrderRequest(
    @NotBlank(message = "مفتاح منع التكرار (Idempotency-Key) إلزامي")
    String idempotencyKey,

    @NotBlank(message = "رمز السلة (cartToken) مطلوب")
    String cartToken,

    @NotBlank(message = "اسم العميل مطلوب")
    String customerName,

    @NotBlank(message = "رقم هاتف التواصل مطلوب")
    @Pattern(regexp = "^(01[0125][0-9]{8}|\\+201[0125][0-9]{8})$", message = "رقم الهاتف غير صالح، يجب أن يكون رقماً مصرياً صحيحاً")
    String customerPhone,

    @NotNull(message = "نوع الاستلام والتوصيل مطلوب")
    FulfillmentType fulfillmentType,

    UUID deliveryZoneId,
    String streetAddress,
    String buildingNumber,
    String floorDoor,
    String landmark,

    @NotNull(message = "الفترة الزمنية المحددة مطلوبة")
    UUID timeSlotId,

    @NotNull(message = "طريقة الدفع مطلوبة")
    PaymentMethod paymentMethod,

    String customerNotes,
    String couponCode
) {}
