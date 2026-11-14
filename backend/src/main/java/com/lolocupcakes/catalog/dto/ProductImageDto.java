package com.lolocupcakes.catalog.dto;

import com.lolocupcakes.catalog.model.ProductImage;
import java.util.UUID;

public record ProductImageDto(
    UUID id,
    String storageKey,
    String altText,
    Integer displayOrder,
    Boolean isPrimary
) {
    public static ProductImageDto fromEntity(ProductImage image) {
        return new ProductImageDto(
            image.getId(),
            image.getStorageKey(),
            image.getAltText(),
            image.getDisplayOrder(),
            image.getIsPrimary()
        );
    }
}
