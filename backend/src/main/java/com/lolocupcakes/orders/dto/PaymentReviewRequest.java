package com.lolocupcakes.orders.dto;

import jakarta.validation.constraints.Size;

public record PaymentReviewRequest(
    @Size(max = 500, message = "الملاحظة يجب ألا تتجاوز 500 حرف")
    String note
) {}
