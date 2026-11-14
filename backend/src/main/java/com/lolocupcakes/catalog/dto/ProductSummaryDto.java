package com.lolocupcakes.catalog.dto;

import com.lolocupcakes.catalog.model.Product;
import com.lolocupcakes.catalog.model.ProductImage;
import com.lolocupcakes.catalog.model.ProductType;
import com.lolocupcakes.catalog.model.SellingUnit;

import java.math.BigDecimal;
import java.util.UUID;

public record ProductSummaryDto(
    UUID id,
    String nameAr,
    String nameEn,
    String slug,
    String descriptionAr,
    ProductType productType,
    String productTypeLabelAr,
    SellingUnit sellingUnit,
    String sellingUnitLabelAr,
    BigDecimal basePrice,
    Integer prepLeadHours,
    Boolean isFeatured,
    Boolean isCustomizable,
    String primaryImageUrl,
    String categoryNameAr,
    String categorySlug,
    Integer stockQuantity,
    Boolean isPreOrder
) {
    public static ProductSummaryDto fromEntity(Product p) {
        String primaryImage = p.getImages().stream()
            .filter(img -> Boolean.TRUE.equals(img.getIsPrimary()))
            .map(ProductImage::getStorageKey)
            .findFirst()
            .orElseGet(() -> p.getImages().stream().map(ProductImage::getStorageKey).findFirst().orElse(null));

        return new ProductSummaryDto(
            p.getId(),
            p.getNameAr(),
            p.getNameEn(),
            p.getSlug(),
            p.getDescriptionAr(),
            p.getProductType(),
            p.getProductType().getLabelAr(),
            p.getSellingUnit(),
            p.getSellingUnit().getLabelAr(),
            p.getBasePrice(),
            p.getPrepLeadHours(),
            p.getIsFeatured(),
            p.getIsCustomizable(),
            primaryImage,
            p.getCategory() != null ? p.getCategory().getNameAr() : null,
            p.getCategory() != null ? p.getCategory().getSlug() : null,
            p.getStockQuantity() != null ? p.getStockQuantity() : 15,
            p.getIsPreOrder() != null ? p.getIsPreOrder() : false
        );
    }
}
