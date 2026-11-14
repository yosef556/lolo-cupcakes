package com.lolocupcakes.cart.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record CheckoutQuoteRequest(
    @NotBlank(message = "رمز السلة (cartToken) مطلوب")
    String cartToken,

    @NotBlank(message = "نوع الاستلام والتوصيل مطلوب (DELIVERY أو PICKUP)")
    String fulfillmentType,

    UUID deliveryZoneId,
    String couponCode
) {}
