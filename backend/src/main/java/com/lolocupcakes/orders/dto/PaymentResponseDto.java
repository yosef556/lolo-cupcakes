package com.lolocupcakes.orders.dto;

import com.lolocupcakes.orders.model.Payment;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record PaymentResponseDto(
    UUID id,
    UUID orderId,
    String paymentMethod,
    BigDecimal amount,
    String currency,
    String status,
    String paymentReference,
    UUID reviewedByUserId,
    Instant reviewedAt,
    String reviewNote,
    List<PaymentProofResponseDto> proofs,
    Instant createdAt
) {
    public static PaymentResponseDto fromEntity(Payment payment) {
        List<PaymentProofResponseDto> proofDtos = payment.getProofs() == null ? List.of() :
            payment.getProofs().stream().map(PaymentProofResponseDto::fromEntity).toList();

        return new PaymentResponseDto(
            payment.getId(),
            payment.getOrderId(),
            payment.getPaymentMethod(),
            payment.getAmount(),
            payment.getCurrency(),
            payment.getStatus(),
            payment.getPaymentReference(),
            payment.getReviewedByUserId(),
            payment.getReviewedAt(),
            payment.getReviewNote(),
            proofDtos,
            payment.getCreatedAt()
        );
    }
}
