package com.lolocupcakes.integrations.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record N8nProductWebhookPayload(
    String event,
    UUID productId,
    String nameAr,
    String nameEn,
    String slug,
    BigDecimal price,
    String currency,
    String categoryNameAr,
    String descriptionAr,
    String primaryImageUrl,
    String facebookPageId,
    String facebookPageUrl,
    String directShopUrl,
    Instant timestamp
) {}
