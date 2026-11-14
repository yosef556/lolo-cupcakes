package com.lolocupcakes.promotions.controller;

import com.lolocupcakes.common.ApiResponse;
import com.lolocupcakes.common.BusinessException;
import com.lolocupcakes.common.ErrorCode;
import com.lolocupcakes.promotions.model.Coupon;
import com.lolocupcakes.promotions.repository.CouponRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/coupons")
@Tag(name = "Admin Coupons", description = "إدارة قسائم وكوبونات الخصم والبروموكود")
public class AdminCouponController {

    private final CouponRepository couponRepository;

    public AdminCouponController(CouponRepository couponRepository) {
        this.couponRepository = couponRepository;
    }

    public record CouponDto(
        UUID id,
        String code,
        String discountType,
        BigDecimal discountValue,
        BigDecimal minOrderAmount,
        Integer maxUses,
        Integer usesCount,
        Instant startDate,
        Instant endDate,
        Boolean isActive,
        Instant createdAt
    ) {
        public static CouponDto fromEntity(Coupon c) {
            return new CouponDto(
                c.getId(),
                c.getCode(),
                c.getDiscountType(),
                c.getDiscountValue(),
                c.getMinOrderAmount(),
                c.getMaxUses(),
                c.getUsesCount(),
                c.getStartDate(),
                c.getEndDate(),
                c.getIsActive(),
                c.getCreatedAt()
            );
        }
    }

    public record CreateCouponRequest(
        String code,
        String discountType, // PERCENTAGE, FIXED
        BigDecimal discountValue,
        BigDecimal minOrderAmount,
        Integer maxUses,
        Instant startDate,
        Instant endDate,
        Boolean isActive
    ) {}

    @GetMapping
    @Operation(summary = "قائمة بجميع كوبونات الخصم")
    public ResponseEntity<ApiResponse<List<CouponDto>>> getAllCoupons() {
        List<CouponDto> coupons = couponRepository.findAll().stream()
            .map(CouponDto::fromEntity)
            .toList();
        return ResponseEntity.ok(ApiResponse.success(coupons));
    }

    @PostMapping
    @Operation(summary = "إنشاء كوبون خصم جديد")
    public ResponseEntity<ApiResponse<CouponDto>> createCoupon(@RequestBody CreateCouponRequest request) {
        if (request.code() == null || request.code().trim().isEmpty()) {
            throw new BusinessException(ErrorCode.VALIDATION_FAILED, "رمز الكوبون مطلوب");
        }
        if (request.discountValue() == null || request.discountValue().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException(ErrorCode.VALIDATION_FAILED, "قيمة الخصم يجب أن تكون أكبر من صفر");
        }

        String cleanCode = request.code().trim().toUpperCase();
        if (couponRepository.findByCodeIgnoreCaseAndIsActiveTrue(cleanCode).isPresent()) {
            throw new BusinessException(ErrorCode.VALIDATION_FAILED, "رمز الكوبون مسجل بالفعل ونشط");
        }

        Coupon coupon = new Coupon();
        coupon.setCode(cleanCode);
        coupon.setDiscountType(request.discountType() != null ? request.discountType().toUpperCase() : "PERCENTAGE");
        coupon.setDiscountValue(request.discountValue());
        coupon.setMinOrderAmount(request.minOrderAmount() != null ? request.minOrderAmount() : BigDecimal.ZERO);
        coupon.setMaxUses(request.maxUses());
        coupon.setStartDate(request.startDate());
        coupon.setEndDate(request.endDate());
        coupon.setIsActive(request.isActive() != null ? request.isActive() : true);

        Coupon saved = couponRepository.save(coupon);
        return ResponseEntity.ok(ApiResponse.success(CouponDto.fromEntity(saved)));
    }

    @PutMapping("/{id}")
    @Operation(summary = "تعديل بيانات كوبون خصم")
    public ResponseEntity<ApiResponse<CouponDto>> updateCoupon(@PathVariable UUID id, @RequestBody CreateCouponRequest request) {
        Coupon coupon = couponRepository.findById(id)
            .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "الكوبون غير موجود"));

        if (request.code() != null && !request.code().trim().isEmpty()) {
            coupon.setCode(request.code().trim().toUpperCase());
        }
        if (request.discountType() != null) {
            coupon.setDiscountType(request.discountType().toUpperCase());
        }
        if (request.discountValue() != null) {
            coupon.setDiscountValue(request.discountValue());
        }
        if (request.minOrderAmount() != null) {
            coupon.setMinOrderAmount(request.minOrderAmount());
        }
        if (request.maxUses() != null) {
            coupon.setMaxUses(request.maxUses());
        }
        if (request.startDate() != null) {
            coupon.setStartDate(request.startDate());
        }
        if (request.endDate() != null) {
            coupon.setEndDate(request.endDate());
        }
        if (request.isActive() != null) {
            coupon.setIsActive(request.isActive());
        }

        Coupon saved = couponRepository.save(coupon);
        return ResponseEntity.ok(ApiResponse.success(CouponDto.fromEntity(saved)));
    }

    @PatchMapping("/{id}/toggle")
    @Operation(summary = "تفعيل أو تعطيل كوبون خصم")
    public ResponseEntity<ApiResponse<CouponDto>> toggleCoupon(@PathVariable UUID id) {
        Coupon coupon = couponRepository.findById(id)
            .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "الكوبون غير موجود"));

        coupon.setIsActive(!Boolean.TRUE.equals(coupon.getIsActive()));
        Coupon saved = couponRepository.save(coupon);
        return ResponseEntity.ok(ApiResponse.success(CouponDto.fromEntity(saved)));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "حذف كوبون خصم")
    public ResponseEntity<ApiResponse<Void>> deleteCoupon(@PathVariable UUID id) {
        if (!couponRepository.existsById(id)) {
            throw new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "الكوبون غير موجود");
        }
        couponRepository.deleteById(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
