package com.lolocupcakes.catalog.service;

import com.lolocupcakes.catalog.dto.CategoryDto;
import com.lolocupcakes.catalog.dto.ProductCreateUpdateRequest;
import com.lolocupcakes.catalog.dto.ProductDetailDto;
import com.lolocupcakes.catalog.dto.ProductSummaryDto;
import com.lolocupcakes.catalog.model.Category;
import com.lolocupcakes.catalog.model.OptionGroup;
import com.lolocupcakes.catalog.model.Product;
import com.lolocupcakes.catalog.model.ProductAddon;
import com.lolocupcakes.catalog.model.ProductImage;
import com.lolocupcakes.catalog.model.ProductType;
import com.lolocupcakes.catalog.repository.CategoryRepository;
import com.lolocupcakes.catalog.repository.OptionGroupRepository;
import com.lolocupcakes.catalog.repository.ProductAddonRepository;
import com.lolocupcakes.catalog.repository.ProductRepository;
import com.lolocupcakes.common.BusinessException;
import com.lolocupcakes.common.ErrorCode;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class AdminCatalogService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final OptionGroupRepository optionGroupRepository;
    private final ProductAddonRepository productAddonRepository;

    public AdminCatalogService(
        ProductRepository productRepository,
        CategoryRepository categoryRepository,
        OptionGroupRepository optionGroupRepository,
        ProductAddonRepository productAddonRepository
    ) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.optionGroupRepository = optionGroupRepository;
        this.productAddonRepository = productAddonRepository;
    }

    @Transactional(readOnly = true)
    public Page<ProductSummaryDto> getAdminProducts(String categorySlug, ProductType productType, String search, Pageable pageable) {
        String searchPattern = (search != null && !search.trim().isEmpty()) ? "%" + search.trim().toLowerCase() + "%" : null;
        return productRepository.findAdminProducts(categorySlug, productType, searchPattern, pageable)
            .map(ProductSummaryDto::fromEntity);
    }

    public ProductDetailDto createProduct(ProductCreateUpdateRequest request) {
        if (productRepository.existsBySlug(request.slug())) {
            throw new BusinessException(ErrorCode.VALIDATION_FAILED, "الاسم التعريفي (slug) مستخدم بالفعل لمنتج آخر");
        }

        Category category = categoryRepository.findById(request.categoryId())
            .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "التصنيف المحدد غير موجود"));

        Product product = new Product(
            category,
            request.nameAr(),
            request.slug(),
            request.productType(),
            request.sellingUnit(),
            request.basePrice(),
            request.prepLeadHours() != null ? request.prepLeadHours() : 2
        );

        product.setNameEn(request.nameEn());
        product.setDescriptionAr(request.descriptionAr());
        product.setDescriptionEn(request.descriptionEn());
        product.setIsActive(request.isActive() != null ? request.isActive() : true);
        product.setIsFeatured(request.isFeatured() != null ? request.isFeatured() : false);
        product.setIsCustomizable(request.isCustomizable() != null ? request.isCustomizable() : false);
        product.setDisplayOrder(request.displayOrder() != null ? request.displayOrder() : 0);
        if (request.stockQuantity() != null) {
            product.setStockQuantity(request.stockQuantity());
        }
        if (request.isPreOrder() != null) {
            product.setIsPreOrder(request.isPreOrder());
        }

        if (request.optionGroupIds() != null && !request.optionGroupIds().isEmpty()) {
            List<OptionGroup> groups = optionGroupRepository.findAllById(request.optionGroupIds());
            product.setOptionGroups(groups);
        }

        if (request.addonIds() != null && !request.addonIds().isEmpty()) {
            List<ProductAddon> addons = productAddonRepository.findAllById(request.addonIds());
            product.setAddons(addons);
        }

        Product saved = productRepository.save(product);
        if (request.primaryImageUrl() != null && !request.primaryImageUrl().isBlank()) {
            saved.getImages().add(new ProductImage(saved.getId(), request.primaryImageUrl().trim(), saved.getNameAr(), 0, true));
            saved = productRepository.save(saved);
        }
        return ProductDetailDto.fromEntity(saved);
    }

    public ProductDetailDto updateProduct(UUID id, ProductCreateUpdateRequest request) {
        Product product = productRepository.findById(id)
            .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "المنتج غير موجود"));

        if (!product.getSlug().equals(request.slug()) && productRepository.existsBySlug(request.slug())) {
            throw new BusinessException(ErrorCode.VALIDATION_FAILED, "الاسم التعريفي (slug) مستخدم بالفعل");
        }

        Category category = categoryRepository.findById(request.categoryId())
            .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "التصنيف المحدد غير موجود"));

        product.setCategory(category);
        product.setNameAr(request.nameAr());
        product.setNameEn(request.nameEn());
        product.setSlug(request.slug());
        product.setDescriptionAr(request.descriptionAr());
        product.setDescriptionEn(request.descriptionEn());
        product.setProductType(request.productType());
        product.setSellingUnit(request.sellingUnit());
        product.setBasePrice(request.basePrice());
        product.setPrepLeadHours(request.prepLeadHours() != null ? request.prepLeadHours() : 2);
        product.setIsActive(request.isActive() != null ? request.isActive() : product.getIsActive());
        product.setIsFeatured(request.isFeatured() != null ? request.isFeatured() : product.getIsFeatured());
        product.setIsCustomizable(request.isCustomizable() != null ? request.isCustomizable() : product.getIsCustomizable());
        product.setDisplayOrder(request.displayOrder() != null ? request.displayOrder() : product.getDisplayOrder());
        if (request.stockQuantity() != null) {
            product.setStockQuantity(request.stockQuantity());
        }
        if (request.isPreOrder() != null) {
            product.setIsPreOrder(request.isPreOrder());
        }

        if (request.optionGroupIds() != null) {
            List<OptionGroup> groups = optionGroupRepository.findAllById(request.optionGroupIds());
            product.setOptionGroups(groups);
        }

        if (request.addonIds() != null) {
            List<ProductAddon> addons = productAddonRepository.findAllById(request.addonIds());
            product.setAddons(addons);
        }

        if (request.primaryImageUrl() != null && !request.primaryImageUrl().isBlank()) {
            String imgUrl = request.primaryImageUrl().trim();
            boolean found = false;
            for (ProductImage img : product.getImages()) {
                if (Boolean.TRUE.equals(img.getIsPrimary())) {
                    img.setStorageKey(imgUrl);
                    found = true;
                    break;
                }
            }
            if (!found) {
                if (!product.getImages().isEmpty()) {
                    product.getImages().get(0).setStorageKey(imgUrl);
                    product.getImages().get(0).setIsPrimary(true);
                } else {
                    product.getImages().add(new ProductImage(product.getId(), imgUrl, product.getNameAr(), 0, true));
                }
            }
        }

        Product saved = productRepository.save(product);
        return ProductDetailDto.fromEntity(saved);
    }

    public void toggleProductStatus(UUID id) {
        Product product = productRepository.findById(id)
            .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "المنتج غير موجود"));
        product.setIsActive(!product.getIsActive());
        productRepository.save(product);
    }

    public void deleteProduct(UUID id) {
        Product product = productRepository.findById(id)
            .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "المنتج غير موجود"));
        productRepository.delete(product);
    }

    public CategoryDto createCategory(CategoryDto dto) {
        if (categoryRepository.existsBySlug(dto.slug())) {
            throw new BusinessException(ErrorCode.VALIDATION_FAILED, "الاسم التعريفي (slug) مستخدم بالفعل");
        }
        Category category = new Category(dto.nameAr(), dto.slug(), dto.displayOrder() != null ? dto.displayOrder() : 0);
        category.setNameEn(dto.nameEn());
        category.setImageStorageKey(dto.imageStorageKey());
        category.setIsActive(dto.isActive() != null ? dto.isActive() : true);
        Category saved = categoryRepository.save(category);
        return CategoryDto.fromEntity(saved);
    }

    public CategoryDto updateCategory(UUID id, CategoryDto dto) {
        Category category = categoryRepository.findById(id)
            .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "التصنيف غير موجود"));
        if (!category.getSlug().equals(dto.slug()) && categoryRepository.existsBySlug(dto.slug())) {
            throw new BusinessException(ErrorCode.VALIDATION_FAILED, "الاسم التعريفي (slug) مستخدم بالفعل");
        }
        category.setNameAr(dto.nameAr());
        category.setNameEn(dto.nameEn());
        category.setSlug(dto.slug());
        category.setDisplayOrder(dto.displayOrder() != null ? dto.displayOrder() : category.getDisplayOrder());
        if (dto.isActive() != null) category.setIsActive(dto.isActive());
        Category saved = categoryRepository.save(category);
        return CategoryDto.fromEntity(saved);
    }

    public void deleteCategory(UUID id) {
        Category category = categoryRepository.findById(id)
            .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "التصنيف غير موجود"));
        categoryRepository.delete(category);
    }
}
