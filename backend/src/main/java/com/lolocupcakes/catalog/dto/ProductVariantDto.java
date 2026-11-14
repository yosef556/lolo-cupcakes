package com.lolocupcakes.catalog.dto;

import com.lolocupcakes.catalog.model.ProductVariant;
import java.math.BigDecimal;
import java.util.UUID;

public record ProductVariantDto(
    UUID id,
    String nameAr,
    String nameEn,
    String sku,
    BigDecimal priceOverride,
    Boolean isActive,
    Integer displayOrder
) {
    public static ProductVariantDto fromEntity(ProductVariant variant) {
        return new ProductVariantDto(
            variant.getId(),
            variant.getNameAr(),
            variant.getNameEn(),
            variant.getSku(),
            variant.getPriceOverride(),
            variant.getIsActive(),
            variant.getDisplayOrder()
        );
    }
}
