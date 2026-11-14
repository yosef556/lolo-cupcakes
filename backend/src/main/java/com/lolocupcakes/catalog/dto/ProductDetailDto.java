package com.lolocupcakes.catalog.dto;

import com.lolocupcakes.catalog.model.Product;
import com.lolocupcakes.catalog.model.ProductType;
import com.lolocupcakes.catalog.model.SellingUnit;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record ProductDetailDto(
    UUID id,
    String nameAr,
    String nameEn,
    String slug,
    String descriptionAr,
    String descriptionEn,
    ProductType productType,
    String productTypeLabelAr,
    SellingUnit sellingUnit,
    String sellingUnitLabelAr,
    BigDecimal basePrice,
    Integer prepLeadHours,
    Boolean isActive,
    Boolean isFeatured,
    Boolean isCustomizable,
    Integer displayOrder,
    CategoryDto category,
    List<ProductImageDto> images,
    List<ProductVariantDto> variants,
    List<OptionGroupDto> optionGroups,
    List<ProductAddonDto> addons
) {
    public static ProductDetailDto fromEntity(Product p) {
        return new ProductDetailDto(
            p.getId(),
            p.getNameAr(),
            p.getNameEn(),
            p.getSlug(),
            p.getDescriptionAr(),
            p.getDescriptionEn(),
            p.getProductType(),
            p.getProductType().getLabelAr(),
            p.getSellingUnit(),
            p.getSellingUnit().getLabelAr(),
            p.getBasePrice(),
            p.getPrepLeadHours(),
            p.getIsActive(),
            p.getIsFeatured(),
            p.getIsCustomizable(),
            p.getDisplayOrder(),
            p.getCategory() != null ? CategoryDto.fromEntity(p.getCategory()) : null,
            p.getImages().stream().map(ProductImageDto::fromEntity).toList(),
            p.getVariants().stream().filter(v -> Boolean.TRUE.equals(v.getIsActive())).map(ProductVariantDto::fromEntity).toList(),
            p.getOptionGroups().stream().map(OptionGroupDto::fromEntity).toList(),
            p.getAddons().stream().filter(a -> Boolean.TRUE.equals(a.getIsActive())).map(ProductAddonDto::fromEntity).toList()
        );
    }
}
