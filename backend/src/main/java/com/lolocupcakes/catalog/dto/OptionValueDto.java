package com.lolocupcakes.catalog.dto;

import com.lolocupcakes.catalog.model.OptionValue;
import java.math.BigDecimal;
import java.util.UUID;

public record OptionValueDto(
    UUID id,
    String nameAr,
    String nameEn,
    BigDecimal priceModifier,
    Boolean isActive,
    Integer displayOrder
) {
    public static OptionValueDto fromEntity(OptionValue val) {
        return new OptionValueDto(
            val.getId(),
            val.getNameAr(),
            val.getNameEn(),
            val.getPriceModifier(),
            val.getIsActive(),
            val.getDisplayOrder()
        );
    }
}
