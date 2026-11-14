package com.lolocupcakes.customcakes.dto;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

import java.time.LocalDate;

public record CreateCustomCakeRequestDto(
    @NotBlank(message = "اسم العميل مطلوب")
    String customerName,

    @NotBlank(message = "رقم هاتف التواصل مطلوب")
    @Pattern(regexp = "^(01[0125][0-9]{8}|\\+201[0125][0-9]{8})$", message = "رقم الهاتف غير صالح، يجب أن يكون رقماً مصرياً صحيحاً")
    String customerPhone,

    String customerEmail,

    @NotNull(message = "تاريخ المناسبة المطلوب إلزامي")
    @FutureOrPresent(message = "تاريخ المناسبة يجب أن يكون اليوم أو في تاريخ لاحق")
    LocalDate requestedDate,

    Integer servingsNeeded,
    String flavorPreference,
    String messageOnCake,
    String notes
) {}
