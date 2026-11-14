package com.lolocupcakes.orders.dto;

import java.util.List;

public record PaymentInstructionDto(
    String method,
    String titleAr,
    String descriptionAr,
    List<InstructionField> fields,
    String proofUploadNote
) {
    public record InstructionField(String labelAr, String value, boolean copyable) {}
}
