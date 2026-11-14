package com.lolocupcakes.orders.dto;

import com.lolocupcakes.orders.model.PaymentProof;
import java.time.Instant;
import java.util.UUID;

public record PaymentProofResponseDto(
    UUID id,
    UUID paymentId,
    String originalFilename,
    Integer fileSize,
    String mimeType,
    Instant uploadedAt
) {
    public static PaymentProofResponseDto fromEntity(PaymentProof proof) {
        return new PaymentProofResponseDto(
            proof.getId(),
            proof.getPaymentId(),
            proof.getOriginalFilename(),
            proof.getFileSize(),
            proof.getMimeType(),
            proof.getUploadedAt()
        );
    }
}
