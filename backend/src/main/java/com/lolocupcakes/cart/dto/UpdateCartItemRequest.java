package com.lolocupcakes.cart.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record UpdateCartItemRequest(
    @NotNull(message = "الكمية مطلوبة")
    @Min(value = 1, message = "أقل كمية هي 1")
    Integer quantity
) {}
