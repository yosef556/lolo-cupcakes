package com.lolocupcakes.catalog.controller;

import com.lolocupcakes.catalog.dto.CategoryDto;
import com.lolocupcakes.catalog.dto.ProductDetailDto;
import com.lolocupcakes.catalog.dto.ProductSummaryDto;
import com.lolocupcakes.catalog.model.ProductType;
import com.lolocupcakes.catalog.service.CatalogService;
import com.lolocupcakes.common.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1")
@Tag(name = "Public Catalog", description = "واجهات استعراض الكتالوج والتصنيفات والمنتجات للعامة")
public class PublicCatalogController {

    private final CatalogService catalogService;

    public PublicCatalogController(CatalogService catalogService) {
        this.catalogService = catalogService;
    }

    @GetMapping("/categories")
    @Operation(summary = "قائمة التصنيفات النشطة")
    public ApiResponse<List<CategoryDto>> getCategories() {
        return ApiResponse.ok(catalogService.getActiveCategories());
    }

    @GetMapping("/products")
    @Operation(summary = "تصفح وبحث وفلترة المنتجات للجمهور")
    public ApiResponse<Page<ProductSummaryDto>> getProducts(
        @RequestParam(required = false) String category,
        @RequestParam(required = false) ProductType type,
        @RequestParam(required = false) String search,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "12") int size,
        @RequestParam(defaultValue = "displayOrder") String sortBy,
        @RequestParam(defaultValue = "asc") String sortDirection
    ) {
        Sort sort = sortDirection.equalsIgnoreCase("desc") ?
            Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        PageRequest pageRequest = PageRequest.of(page, size, sort);

        Page<ProductSummaryDto> products = catalogService.getPublicProducts(category, type, search, pageRequest);
        return ApiResponse.ok(products);
    }

    @GetMapping("/products/{slug}")
    @Operation(summary = "تفاصيل منتج معين بواسطة الـ slug")
    public ApiResponse<ProductDetailDto> getProductBySlug(@PathVariable String slug) {
        return ApiResponse.ok(catalogService.getProductBySlug(slug));
    }

    @GetMapping("/products/{slug}/available-options")
    @Operation(summary = "خيارات التخصيص والإضافات المتوافقة مع هذا المنتج")
    public ApiResponse<Map<String, Object>> getAvailableOptions(@PathVariable String slug) {
        return ApiResponse.ok(catalogService.getAvailableOptions(slug));
    }

    @GetMapping("/storefront/home")
    @Operation(summary = "بيانات الصفحة الرئيسية للمتجر")
    public ApiResponse<Map<String, Object>> getStorefrontHome() {
        return ApiResponse.ok(catalogService.getStorefrontHome());
    }
}
