package com.lolocupcakes.catalog.dto;

import com.lolocupcakes.catalog.model.ProductAddon;
import java.math.BigDecimal;
import java.util.UUID;

public record ProductAddonDto(
    UUID id,
    String nameAr,
    String nameEn,
    BigDecimal price,
    Boolean isActive,
    Integer displayOrder
) {
    public static ProductAddonDto fromEntity(ProductAddon addon) {
        return new ProductAddonDto(
            addon.getId(),
            addon.getNameAr(),
            addon.getNameEn(),
            addon.getPrice(),
            addon.getIsActive(),
            addon.getDisplayOrder()
        );
    }
}
