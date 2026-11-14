package com.lolocupcakes.promotions.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "coupons")
public class Coupon {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "code", nullable = false, unique = true)
    private String code;

    @Column(name = "discount_type", nullable = false)
    private String discountType; // PERCENTAGE, FIXED

    @Column(name = "discount_value", nullable = false)
    private BigDecimal discountValue;

    @Column(name = "min_order_amount", nullable = false)
    private BigDecimal minOrderAmount = BigDecimal.ZERO;

    @Column(name = "max_uses")
    private Integer maxUses;

    @Column(name = "uses_count", nullable = false)
    private Integer usesCount = 0;

    @Column(name = "start_date")
    private Instant startDate;

    @Column(name = "end_date")
    private Instant endDate;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public Coupon() {}

    public boolean isValid(BigDecimal orderSubtotal) {
        if (!Boolean.TRUE.equals(isActive)) return false;
        if (startDate != null && Instant.now().isBefore(startDate)) return false;
        if (endDate != null && Instant.now().isAfter(endDate)) return false;
        if (maxUses != null && usesCount >= maxUses) return false;
        return orderSubtotal.compareTo(minOrderAmount) >= 0;
    }

    public BigDecimal calculateDiscount(BigDecimal subtotal) {
        if (!isValid(subtotal)) return BigDecimal.ZERO;
        if ("PERCENTAGE".equalsIgnoreCase(discountType)) {
            BigDecimal percentage = discountValue.divide(BigDecimal.valueOf(100));
            return subtotal.multiply(percentage).setScale(2, java.math.RoundingMode.HALF_UP);
        } else {
            return discountValue.min(subtotal);
        }
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    public String getDiscountType() { return discountType; }
    public void setDiscountType(String discountType) { this.discountType = discountType; }
    public BigDecimal getDiscountValue() { return discountValue; }
    public void setDiscountValue(BigDecimal discountValue) { this.discountValue = discountValue; }
    public BigDecimal getMinOrderAmount() { return minOrderAmount; }
    public void setMinOrderAmount(BigDecimal minOrderAmount) { this.minOrderAmount = minOrderAmount; }
    public Integer getMaxUses() { return maxUses; }
    public void setMaxUses(Integer maxUses) { this.maxUses = maxUses; }
    public Integer getUsesCount() { return usesCount; }
    public void setUsesCount(Integer usesCount) { this.usesCount = usesCount; }
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean active) { isActive = active; }
    public Instant getStartDate() { return startDate; }
    public void setStartDate(Instant startDate) { this.startDate = startDate; }
    public Instant getEndDate() { return endDate; }
    public void setEndDate(Instant endDate) { this.endDate = endDate; }
    public Instant getCreatedAt() { return createdAt; }
}
