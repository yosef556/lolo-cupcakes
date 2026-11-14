package com.lolocupcakes.cart.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record CartItemDto(
    UUID id,
    UUID productId,
    String productNameAr,
    String productSlug,
    UUID variantId,
    String variantNameAr,
    BigDecimal unitPrice,
    int quantity,
    BigDecimal lineTotal,
    String selectedConfiguration,
    List<String> optionDescriptions,
    List<String> addonDescriptions
) {}
