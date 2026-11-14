package com.lolocupcakes.catalog.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "products")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @Column(name = "name_ar", nullable = false)
    private String nameAr;

    @Column(name = "name_en")
    private String nameEn;

    @Column(name = "slug", nullable = false, unique = true)
    private String slug;

    @Column(name = "description_ar")
    private String descriptionAr;

    @Column(name = "description_en")
    private String descriptionEn;

    @Enumerated(EnumType.STRING)
    @Column(name = "product_type", nullable = false)
    private ProductType productType;

    @Enumerated(EnumType.STRING)
    @Column(name = "selling_unit", nullable = false)
    private SellingUnit sellingUnit = SellingUnit.PIECE;

    @Column(name = "base_price", nullable = false)
    private BigDecimal basePrice;

    @Column(name = "prep_lead_hours", nullable = false)
    private Integer prepLeadHours = 2;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(name = "is_featured", nullable = false)
    private Boolean isFeatured = false;

    @Column(name = "is_customizable", nullable = false)
    private Boolean isCustomizable = false;

    @Column(name = "display_order", nullable = false)
    private Integer displayOrder = 0;

    @Column(name = "stock_quantity", nullable = false)
    private Integer stockQuantity = 15;

    @Column(name = "is_pre_order", nullable = false)
    private Boolean isPreOrder = false;

    @OneToMany(mappedBy = "productId", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("displayOrder ASC")
    private List<ProductImage> images = new ArrayList<>();

    @OneToMany(mappedBy = "productId", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("displayOrder ASC")
    private List<ProductVariant> variants = new ArrayList<>();

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "product_option_groups",
        joinColumns = @JoinColumn(name = "product_id"),
        inverseJoinColumns = @JoinColumn(name = "option_group_id")
    )
    private List<OptionGroup> optionGroups = new ArrayList<>();

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "product_addon_assignments",
        joinColumns = @JoinColumn(name = "product_id"),
        inverseJoinColumns = @JoinColumn(name = "addon_id")
    )
    private List<ProductAddon> addons = new ArrayList<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    public Product() {}

    public Product(Category category, String nameAr, String slug, ProductType productType, SellingUnit sellingUnit, BigDecimal basePrice, Integer prepLeadHours) {
        this.category = category;
        this.nameAr = nameAr;
        this.slug = slug;
        this.productType = productType;
        this.sellingUnit = sellingUnit;
        this.basePrice = basePrice;
        this.prepLeadHours = prepLeadHours;
        this.isActive = true;
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = Instant.now();
    }

    // Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public Category getCategory() { return category; }
    public void setCategory(Category category) { this.category = category; }
    public String getNameAr() { return nameAr; }
    public void setNameAr(String nameAr) { this.nameAr = nameAr; }
    public String getNameEn() { return nameEn; }
    public void setNameEn(String nameEn) { this.nameEn = nameEn; }
    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }
    public String getDescriptionAr() { return descriptionAr; }
    public void setDescriptionAr(String descriptionAr) { this.descriptionAr = descriptionAr; }
    public String getDescriptionEn() { return descriptionEn; }
    public void setDescriptionEn(String descriptionEn) { this.descriptionEn = descriptionEn; }
    public ProductType getProductType() { return productType; }
    public void setProductType(ProductType productType) { this.productType = productType; }
    public SellingUnit getSellingUnit() { return sellingUnit; }
    public void setSellingUnit(SellingUnit sellingUnit) { this.sellingUnit = sellingUnit; }
    public BigDecimal getBasePrice() { return basePrice; }
    public void setBasePrice(BigDecimal basePrice) { this.basePrice = basePrice; }
    public Integer getPrepLeadHours() { return prepLeadHours; }
    public void setPrepLeadHours(Integer prepLeadHours) { this.prepLeadHours = prepLeadHours; }
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean active) { isActive = active; }
    public Boolean getIsFeatured() { return isFeatured; }
    public void setIsFeatured(Boolean featured) { isFeatured = featured; }
    public Boolean getIsCustomizable() { return isCustomizable; }
    public void setIsCustomizable(Boolean customizable) { isCustomizable = customizable; }
    public Integer getDisplayOrder() { return displayOrder; }
    public void setDisplayOrder(Integer displayOrder) { this.displayOrder = displayOrder; }
    public List<ProductImage> getImages() { return images; }
    public void setImages(List<ProductImage> images) { this.images = images; }
    public List<ProductVariant> getVariants() { return variants; }
    public void setVariants(List<ProductVariant> variants) { this.variants = variants; }
    public List<OptionGroup> getOptionGroups() { return optionGroups; }
    public void setOptionGroups(List<OptionGroup> optionGroups) { this.optionGroups = optionGroups; }
    public List<ProductAddon> getAddons() { return addons; }
    public void setAddons(List<ProductAddon> addons) { this.addons = addons; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public Integer getStockQuantity() { return stockQuantity; }
    public void setStockQuantity(Integer stockQuantity) { this.stockQuantity = stockQuantity; }
    public Boolean getIsPreOrder() { return isPreOrder; }
    public void setIsPreOrder(Boolean isPreOrder) { this.isPreOrder = isPreOrder; }
}
