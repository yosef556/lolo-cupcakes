package com.lolocupcakes.catalog.model;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "product_images")
public class ProductImage {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "product_id", nullable = false)
    private UUID productId;

    @Column(name = "storage_key", nullable = false)
    private String storageKey;

    @Column(name = "alt_text")
    private String altText;

    @Column(name = "display_order", nullable = false)
    private Integer displayOrder = 0;

    @Column(name = "is_primary", nullable = false)
    private Boolean isPrimary = false;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public ProductImage() {}

    public ProductImage(UUID productId, String storageKey, String altText, Integer displayOrder, Boolean isPrimary) {
        this.productId = productId;
        this.storageKey = storageKey;
        this.altText = altText;
        this.displayOrder = displayOrder;
        this.isPrimary = isPrimary;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getProductId() { return productId; }
    public void setProductId(UUID productId) { this.productId = productId; }
    public String getStorageKey() { return storageKey; }
    public void setStorageKey(String storageKey) { this.storageKey = storageKey; }
    public String getAltText() { return altText; }
    public void setAltText(String altText) { this.altText = altText; }
    public Integer getDisplayOrder() { return displayOrder; }
    public void setDisplayOrder(Integer displayOrder) { this.displayOrder = displayOrder; }
    public Boolean getIsPrimary() { return isPrimary; }
    public void setIsPrimary(Boolean primary) { isPrimary = primary; }
    public Instant getCreatedAt() { return createdAt; }
}
