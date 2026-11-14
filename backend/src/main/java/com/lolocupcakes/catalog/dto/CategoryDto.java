package com.lolocupcakes.catalog.dto;

import com.lolocupcakes.catalog.model.Category;
import java.util.UUID;

public record CategoryDto(
    UUID id,
    String nameAr,
    String nameEn,
    String slug,
    Integer displayOrder,
    Boolean isActive,
    String imageStorageKey
) {
    public static CategoryDto fromEntity(Category category) {
        return new CategoryDto(
            category.getId(),
            category.getNameAr(),
            category.getNameEn(),
            category.getSlug(),
            category.getDisplayOrder(),
            category.getIsActive(),
            category.getImageStorageKey()
        );
    }
}
