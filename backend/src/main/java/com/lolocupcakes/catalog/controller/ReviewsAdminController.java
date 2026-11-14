package com.lolocupcakes.catalog.controller;

import com.lolocupcakes.catalog.model.ProductReview;
import com.lolocupcakes.catalog.repository.ProductRepository;
import com.lolocupcakes.catalog.repository.ProductReviewRepository;
import com.lolocupcakes.common.ApiResponse;
import com.lolocupcakes.common.BusinessException;
import com.lolocupcakes.common.ErrorCode;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
@Tag(name = "Reviews Admin & Feed", description = "إدارة وعرض تقييمات المتجر")
public class ReviewsAdminController {

    private final ProductReviewRepository reviewRepository;
    private final ProductRepository productRepository;

    public ReviewsAdminController(ProductReviewRepository reviewRepository, ProductRepository productRepository) {
        this.reviewRepository = reviewRepository;
        this.productRepository = productRepository;
    }

    public record AdminReviewItemDto(
        UUID id,
        UUID productId,
        String productNameAr,
        String customerName,
        Integer rating,
        String comment,
        java.time.Instant createdAt
    ) {}

    public record CreateAdminReviewRequest(
        UUID productId,
        String customerName,
        Integer rating,
        String comment
    ) {}

    @GetMapping("/reviews/featured")
    @Operation(summary = "جلب التقييمات المميزة للصفحة الرئيسية")
    public ResponseEntity<ApiResponse<List<AdminReviewItemDto>>> getFeaturedReviews() {
        List<ProductReview> list = reviewRepository.findAllByOrderByCreatedAtDesc();
        List<AdminReviewItemDto> dtos = list.stream().map(r -> {
            String prodName = productRepository.findById(r.getProductId())
                .map(p -> p.getNameAr())
                .orElse("حلويات لولو كب كيك");
            return new AdminReviewItemDto(
                r.getId(),
                r.getProductId(),
                prodName,
                r.getCustomerName(),
                r.getRating(),
                r.getComment(),
                r.getCreatedAt()
            );
        }).toList();
        return ResponseEntity.ok(ApiResponse.success(dtos));
    }

    @GetMapping("/admin/reviews")
    @Operation(summary = "عرض جميع تقييمات العملاء للوحة تحكم الأدمن")
    public ResponseEntity<ApiResponse<List<AdminReviewItemDto>>> getAllReviewsForAdmin() {
        return getFeaturedReviews();
    }

    @PostMapping("/admin/reviews")
    @Operation(summary = "إضافة رأي عميل موثق من قبل الأدمن")
    public ResponseEntity<ApiResponse<AdminReviewItemDto>> createAdminReview(
        @RequestBody CreateAdminReviewRequest request
    ) {
        if (request.customerName() == null || request.customerName().isBlank()) {
            throw new BusinessException(ErrorCode.VALIDATION_FAILED, "اسم العميل مطلوب");
        }
        UUID targetProdId = request.productId();
        if (targetProdId == null) {
            targetProdId = productRepository.findAll().stream()
                .findFirst()
                .map(p -> p.getId())
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "لا يوجد منتجات بالمتجر"));
        }

        ProductReview review = new ProductReview(
            targetProdId,
            null,
            request.customerName().trim(),
            request.rating() != null ? request.rating() : 5,
            request.comment() != null ? request.comment().trim() : ""
        );
        ProductReview saved = reviewRepository.save(review);
        String prodName = productRepository.findById(saved.getProductId())
            .map(p -> p.getNameAr())
            .orElse("حلويات لولو كب كيك");

        return ResponseEntity.ok(ApiResponse.success(new AdminReviewItemDto(
            saved.getId(),
            saved.getProductId(),
            prodName,
            saved.getCustomerName(),
            saved.getRating(),
            saved.getComment(),
            saved.getCreatedAt()
        )));
    }

    @DeleteMapping("/admin/reviews/{id}")
    @Operation(summary = "حذف تقييم بواسطة الأدمن")
    public ResponseEntity<ApiResponse<Void>> deleteReview(@PathVariable UUID id) {
        if (!reviewRepository.existsById(id)) {
            throw new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "التقييم غير موجود");
        }
        reviewRepository.deleteById(id);
        return ResponseEntity.ok(ApiResponse.success(null, "تم حذف التقييم بنجاح"));
    }
}
