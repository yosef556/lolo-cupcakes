package com.lolocupcakes.catalog.service;

import com.lolocupcakes.catalog.dto.*;
import com.lolocupcakes.catalog.model.Category;
import com.lolocupcakes.catalog.model.Product;
import com.lolocupcakes.catalog.model.ProductType;
import com.lolocupcakes.catalog.repository.CategoryRepository;
import com.lolocupcakes.catalog.repository.ProductRepository;
import com.lolocupcakes.common.BusinessException;
import com.lolocupcakes.common.ErrorCode;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
@Transactional(readOnly = true)
public class CatalogService {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;

    public CatalogService(CategoryRepository categoryRepository, ProductRepository productRepository) {
        this.categoryRepository = categoryRepository;
        this.productRepository = productRepository;
    }

    public List<CategoryDto> getActiveCategories() {
        return categoryRepository.findByIsActiveTrueOrderByDisplayOrderAsc().stream()
            .map(CategoryDto::fromEntity)
            .toList();
    }

    public Page<ProductSummaryDto> getPublicProducts(String categorySlug, ProductType productType, String search, Pageable pageable) {
        String searchPattern = (search != null && !search.trim().isEmpty()) ? "%" + search.trim().toLowerCase() + "%" : null;
        return productRepository.findPublicProducts(categorySlug, productType, searchPattern, pageable)
            .map(ProductSummaryDto::fromEntity);
    }

    public ProductDetailDto getProductBySlug(String identifier) {
        Product product = null;
        try {
            java.util.UUID id = java.util.UUID.fromString(identifier);
            product = productRepository.findById(id).orElse(null);
        } catch (IllegalArgumentException ignored) {}

        if (product == null) {
            product = productRepository.findBySlugAndIsActiveTrue(identifier).orElse(null);
        }

        if (product == null) {
            throw new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "المنتج غير موجود أو غير متاح حالياً");
        }
        return ProductDetailDto.fromEntity(product);
    }

    public Map<String, Object> getAvailableOptions(String slug) {
        Product product = productRepository.findBySlugAndIsActiveTrue(slug)
            .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "المنتج غير موجود"));

        List<OptionGroupDto> optionGroups = product.getOptionGroups().stream()
            .map(OptionGroupDto::fromEntity)
            .toList();

        List<ProductAddonDto> addons = product.getAddons().stream()
            .filter(a -> Boolean.TRUE.equals(a.getIsActive()))
            .map(ProductAddonDto::fromEntity)
            .toList();

        List<ProductVariantDto> variants = product.getVariants().stream()
            .filter(v -> Boolean.TRUE.equals(v.getIsActive()))
            .map(ProductVariantDto::fromEntity)
            .toList();

        return Map.of(
            "productId", product.getId(),
            "productName", product.getNameAr(),
            "basePrice", product.getBasePrice(),
            "variants", variants,
            "optionGroups", optionGroups,
            "addons", addons
        );
    }

    public Map<String, Object> getStorefrontHome() {
        List<CategoryDto> categories = getActiveCategories();
        List<ProductSummaryDto> featuredProducts = productRepository.findTop8ByIsFeaturedTrueAndIsActiveTrueOrderByDisplayOrderAsc().stream()
            .map(ProductSummaryDto::fromEntity)
            .toList();

        return Map.of(
            "categories", categories,
            "featuredProducts", featuredProducts
        );
    }
}
