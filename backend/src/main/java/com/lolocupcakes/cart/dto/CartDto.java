package com.lolocupcakes.cart.dto;

import java.math.BigDecimal;
import java.util.List;

public record CartDto(
    String cartToken,
    List<CartItemDto> items,
    int totalQuantity,
    BigDecimal subtotal,
    String currency
) {
    public static CartDto of(String cartToken, List<CartItemDto> items, BigDecimal subtotal) {
        int totalQuantity = items.stream().mapToInt(CartItemDto::quantity).sum();
        return new CartDto(cartToken, items, totalQuantity, subtotal, "EGP");
    }
}
