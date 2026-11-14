package com.lolocupcakes.catalog.controller;

import com.lolocupcakes.catalog.dto.CategoryDto;
import com.lolocupcakes.catalog.dto.ProductCreateUpdateRequest;
import com.lolocupcakes.catalog.dto.ProductDetailDto;
import com.lolocupcakes.catalog.dto.ProductSummaryDto;
import com.lolocupcakes.catalog.model.ProductType;
import com.lolocupcakes.catalog.service.AdminCatalogService;
import com.lolocupcakes.common.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin")
@Tag(name = "Admin Catalog", description = "لوحة تحكم المشرفين لإدارة المنتجات والتصنيفات والخيارات")
public class AdminCatalogController {

    private final AdminCatalogService adminCatalogService;

    public AdminCatalogController(AdminCatalogService adminCatalogService) {
        this.adminCatalogService = adminCatalogService;
    }

    @GetMapping("/products")
    @Operation(summary = "عرض كافة المنتجات للإدارة مع الفلترة والبحث")
    public ApiResponse<Page<ProductSummaryDto>> getAdminProducts(
        @RequestParam(required = false) String category,
        @RequestParam(required = false) ProductType type,
        @RequestParam(required = false) String search,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size
    ) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ApiResponse.ok(adminCatalogService.getAdminProducts(category, type, search, pageRequest));
    }

    @PostMapping("/products")
    @Operation(summary = "إضافة منتج جديد")
    public ApiResponse<ProductDetailDto> createProduct(@Valid @RequestBody ProductCreateUpdateRequest request) {
        return ApiResponse.ok("تم إنشاء المنتج بنجاح", adminCatalogService.createProduct(request));
    }

    @PutMapping("/products/{id}")
    @Operation(summary = "تحديث بيانات منتج قائم")
    public ApiResponse<ProductDetailDto> updateProduct(
        @PathVariable UUID id,
        @Valid @RequestBody ProductCreateUpdateRequest request
    ) {
        return ApiResponse.ok("تم تحديث المنتج بنجاح", adminCatalogService.updateProduct(id, request));
    }

    @PatchMapping("/products/{id}/toggle-status")
    @Operation(summary = "تغيير حالة تفعيل المنتج (نشط / غير نشط)")
    public ApiResponse<Void> toggleProductStatus(@PathVariable UUID id) {
        adminCatalogService.toggleProductStatus(id);
        return ApiResponse.ok("تم تحديث حالة المنتج بنجاح", null);
    }

    @DeleteMapping("/products/{id}")
    @Operation(summary = "حذف منتج")
    public ApiResponse<Void> deleteProduct(@PathVariable UUID id) {
        adminCatalogService.deleteProduct(id);
        return ApiResponse.ok("تم حذف المنتج بنجاح", null);
    }

    @PostMapping("/categories")
    @Operation(summary = "إضافة تصنيف جديد")
    public ApiResponse<CategoryDto> createCategory(@Valid @RequestBody CategoryDto dto) {
        return ApiResponse.ok("تم إنشاء التصنيف بنجاح", adminCatalogService.createCategory(dto));
    }

    @PutMapping("/categories/{id}")
    @Operation(summary = "تعديل تصنيف قائم")
    public ApiResponse<CategoryDto> updateCategory(@PathVariable UUID id, @Valid @RequestBody CategoryDto dto) {
        return ApiResponse.ok("تم تحديث التصنيف بنجاح", adminCatalogService.updateCategory(id, dto));
    }

    @DeleteMapping("/categories/{id}")
    @Operation(summary = "حذف تصنيف")
    public ApiResponse<Void> deleteCategory(@PathVariable UUID id) {
        adminCatalogService.deleteCategory(id);
        return ApiResponse.ok("تم حذف التصنيف بنجاح", null);
    }
}
