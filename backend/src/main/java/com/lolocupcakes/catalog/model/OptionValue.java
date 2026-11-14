package com.lolocupcakes.catalog.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "option_values")
public class OptionValue {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "option_group_id", nullable = false)
    @JsonIgnore
    private OptionGroup optionGroup;

    @Column(name = "name_ar", nullable = false)
    private String nameAr;

    @Column(name = "name_en")
    private String nameEn;

    @Column(name = "price_modifier", nullable = false)
    private BigDecimal priceModifier = BigDecimal.ZERO;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(name = "display_order", nullable = false)
    private Integer displayOrder = 0;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public OptionValue() {}

    public OptionValue(OptionGroup optionGroup, String nameAr, BigDecimal priceModifier, Integer displayOrder) {
        this.optionGroup = optionGroup;
        this.nameAr = nameAr;
        this.priceModifier = priceModifier;
        this.displayOrder = displayOrder;
        this.isActive = true;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public OptionGroup getOptionGroup() { return optionGroup; }
    public void setOptionGroup(OptionGroup optionGroup) { this.optionGroup = optionGroup; }
    public String getNameAr() { return nameAr; }
    public void setNameAr(String nameAr) { this.nameAr = nameAr; }
    public String getNameEn() { return nameEn; }
    public void setNameEn(String nameEn) { this.nameEn = nameEn; }
    public BigDecimal getPriceModifier() { return priceModifier; }
    public void setPriceModifier(BigDecimal priceModifier) { this.priceModifier = priceModifier; }
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean active) { isActive = active; }
    public Integer getDisplayOrder() { return displayOrder; }
    public void setDisplayOrder(Integer displayOrder) { this.displayOrder = displayOrder; }
    public Instant getCreatedAt() { return createdAt; }
}
