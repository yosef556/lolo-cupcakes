package com.lolocupcakes.customcakes.dto;

import com.lolocupcakes.customcakes.model.CustomCakeQuote;
import com.lolocupcakes.customcakes.model.QuoteStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record CustomCakeQuoteDto(
    UUID id,
    BigDecimal quotedPrice,
    String termsAndDetails,
    Instant expiresAt,
    QuoteStatus status,
    String statusLabelAr,
    Instant respondedAt,
    Instant createdAt,
    boolean isExpired
) {
    public static CustomCakeQuoteDto fromEntity(CustomCakeQuote quote) {
        boolean expired = quote.getStatus() == QuoteStatus.PENDING && Instant.now().isAfter(quote.getExpiresAt());
        QuoteStatus effectiveStatus = expired ? QuoteStatus.EXPIRED : quote.getStatus();

        return new CustomCakeQuoteDto(
            quote.getId(),
            quote.getQuotedPrice(),
            quote.getTermsAndDetails(),
            quote.getExpiresAt(),
            effectiveStatus,
            effectiveStatus.getLabelAr(),
            quote.getRespondedAt(),
            quote.getCreatedAt(),
            expired
        );
    }
}
