package com.lolocupcakes.cart.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import java.util.UUID;

public record AddToCartRequest(
    @NotNull(message = "معرف المنتج مطلوب")
    UUID productId,

    UUID variantId,

    @NotNull(message = "الكمية مطلوبة")
    @Min(value = 1, message = "أقل كمية للإضافة هي 1")
    Integer quantity,

    List<UUID> selectedOptionValueIds,
    List<UUID> selectedAddonIds,
    String customerNote
) {}
