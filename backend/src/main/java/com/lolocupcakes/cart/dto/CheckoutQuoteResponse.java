package com.lolocupcakes.cart.dto;

import java.math.BigDecimal;
import java.util.List;

public record CheckoutQuoteResponse(
    boolean isValid,
    String fulfillmentType,
    String deliveryZoneName,
    BigDecimal subtotal,
    BigDecimal discountAmount,
    BigDecimal deliveryFee,
    BigDecimal totalAmount,
    String currency,
    List<CartItemDto> items,
    List<String> warnings
) {}
