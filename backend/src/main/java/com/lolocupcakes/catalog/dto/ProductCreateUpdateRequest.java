package com.lolocupcakes.catalog.dto;

import com.lolocupcakes.catalog.model.ProductType;
import com.lolocupcakes.catalog.model.SellingUnit;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record ProductCreateUpdateRequest(
    @NotNull(message = "معرف التصنيف مطلوب")
    UUID categoryId,

    @NotBlank(message = "اسم المنتج بالعربية مطلوب")
    String nameAr,

    String nameEn,

    @NotBlank(message = "الاسم التعريفي (slug) مطلوب")
    String slug,

    String descriptionAr,
    String descriptionEn,

    @NotNull(message = "نوع المنتج مطلوب")
    ProductType productType,

    @NotNull(message = "وحدة البيع مطلوبة")
    SellingUnit sellingUnit,

    @NotNull(message = "السعر الأساسي مطلوب")
    @DecimalMin(value = "0.00", message = "السعر الأساسي يجب أن يكون صفراً أو أكثر")
    BigDecimal basePrice,

    @Min(value = 0, message = "فترة التجهيز بالساعات يجب ألا تقل عن 0")
    Integer prepLeadHours,

    Boolean isActive,
    Boolean isFeatured,
    Boolean isCustomizable,
    Integer displayOrder,
    Integer stockQuantity,
    Boolean isPreOrder,

    List<UUID> optionGroupIds,
    List<UUID> addonIds,
    String primaryImageUrl
) {}
