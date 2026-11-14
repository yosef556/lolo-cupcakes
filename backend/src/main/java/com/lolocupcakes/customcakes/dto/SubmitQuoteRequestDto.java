package com.lolocupcakes.customcakes.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record SubmitQuoteRequestDto(
    @NotNull(message = "السعر المعروض إلزامي")
    @DecimalMin(value = "1.00", message = "السعر المعروض يجب أن يكون أكبر من صفر")
    BigDecimal quotedPrice,

    @NotBlank(message = "الشروط والتفاصيل الفنية للتورتة مطلوبة")
    String termsAndDetails,

    Integer expiresInHours
) {}
