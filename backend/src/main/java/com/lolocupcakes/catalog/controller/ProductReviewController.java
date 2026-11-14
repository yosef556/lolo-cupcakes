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

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/products/{productId}/reviews")
@Tag(name = "Product Reviews", description = "تقييمات وآراء العملاء على المنتجات")
public class ProductReviewController {

    private final ProductReviewRepository reviewRepository;
    private final ProductRepository productRepository;

    public ProductReviewController(ProductReviewRepository reviewRepository, ProductRepository productRepository) {
        this.reviewRepository = reviewRepository;
        this.productRepository = productRepository;
    }

    public record ReviewDto(
        UUID id,
        UUID productId,
        UUID userId,
        String customerName,
        Integer rating,
        String comment,
        Instant createdAt
    ) {
        public static ReviewDto fromEntity(ProductReview r) {
            return new ReviewDto(
                r.getId(),
                r.getProductId(),
                r.getUserId(),
                r.getCustomerName(),
                r.getRating(),
                r.getComment(),
                r.getCreatedAt()
            );
        }
    }

    public record CreateReviewRequest(
        String customerName,
        Integer rating,
        String comment,
        UUID userId
    ) {}

    @GetMapping
    @Operation(summary = "جلب تقييمات المنتج")
    public ResponseEntity<ApiResponse<List<ReviewDto>>> getReviews(@PathVariable UUID productId) {
        List<ReviewDto> list = reviewRepository.findByProductIdOrderByCreatedAtDesc(productId).stream()
            .map(ReviewDto::fromEntity)
            .toList();
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @PostMapping
    @Operation(summary = "إضافة تقييم جديد للمنتج")
    public ResponseEntity<ApiResponse<ReviewDto>> createReview(
        @PathVariable UUID productId,
        @RequestBody CreateReviewRequest request
    ) {
        if (!productRepository.existsById(productId)) {
            throw new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "المنتج غير موجود");
        }
        if (request.customerName() == null || request.customerName().trim().isEmpty()) {
            throw new BusinessException(ErrorCode.VALIDATION_FAILED, "اسم صاحب التقييم مطلوب");
        }
        if (request.rating() == null || request.rating() < 1 || request.rating() > 5) {
            throw new BusinessException(ErrorCode.VALIDATION_FAILED, "التقييم يجب أن يكون بين 1 و 5 نجوم");
        }

        ProductReview review = new ProductReview(
            productId,
            request.userId(),
            request.customerName().trim(),
            request.rating(),
            request.comment() != null ? request.comment().trim() : ""
        );

        ProductReview saved = reviewRepository.save(review);
        return ResponseEntity.ok(ApiResponse.success(ReviewDto.fromEntity(saved)));
    }
}
