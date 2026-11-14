package com.lolocupcakes.customcakes.dto;

import com.lolocupcakes.customcakes.model.CustomCakeRequest;
import com.lolocupcakes.customcakes.model.CustomCakeStatus;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record CustomCakeRequestResponseDto(
    UUID id,
    String publicReference,
    String accessToken,
    String customerName,
    String customerPhone,
    String customerEmail,
    LocalDate requestedDate,
    Integer servingsNeeded,
    String flavorPreference,
    String messageOnCake,
    String notes,
    CustomCakeStatus status,
    String statusLabelAr,
    boolean hasReferenceImage,
    List<CustomCakeQuoteDto> quotes,
    Instant createdAt
) {
    public static CustomCakeRequestResponseDto fromEntity(CustomCakeRequest req, boolean includeToken) {
        List<CustomCakeQuoteDto> quoteDtos = req.getQuotes() == null ? List.of() :
            req.getQuotes().stream().map(CustomCakeQuoteDto::fromEntity).toList();

        return new CustomCakeRequestResponseDto(
            req.getId(),
            req.getPublicReference(),
            includeToken ? req.getAccessToken() : null,
            req.getCustomerName(),
            req.getCustomerPhone(),
            req.getCustomerEmail(),
            req.getRequestedDate(),
            req.getServingsNeeded(),
            req.getFlavorPreference(),
            req.getMessageOnCake(),
            req.getNotes(),
            req.getStatus(),
            req.getStatus().getLabelAr(),
            req.getReferenceImageStorageKey() != null,
            quoteDtos,
            req.getCreatedAt()
        );
    }
}
