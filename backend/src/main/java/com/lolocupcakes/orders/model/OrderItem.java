package com.lolocupcakes.orders.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "order_items")
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    @JsonIgnore
    private Order order;

    @Column(name = "product_id")
    private UUID productId;

    @Column(name = "variant_id")
    private UUID variantId;

    @Column(name = "product_name_snapshot", nullable = false)
    private String productNameSnapshot;

    @Column(name = "variant_name_snapshot")
    private String variantNameSnapshot;

    @Column(name = "unit_price_snapshot", nullable = false)
    private BigDecimal unitPriceSnapshot;

    @Column(name = "quantity", nullable = false)
    private Integer quantity;

    @Column(name = "line_total", nullable = false)
    private BigDecimal lineTotal;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "options_snapshot", nullable = false)
    private String optionsSnapshot = "{}";

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "addons_snapshot", nullable = false)
    private String addonsSnapshot = "{}";

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "custom_details_snapshot", nullable = false)
    private String customDetailsSnapshot = "{}";

    public OrderItem() {}

    public OrderItem(
        Order order,
        UUID productId,
        UUID variantId,
        String productNameSnapshot,
        String variantNameSnapshot,
        BigDecimal unitPriceSnapshot,
        Integer quantity,
        BigDecimal lineTotal,
        String optionsSnapshot,
        String addonsSnapshot,
        String customDetailsSnapshot
    ) {
        this.order = order;
        this.productId = productId;
        this.variantId = variantId;
        this.productNameSnapshot = productNameSnapshot;
        this.variantNameSnapshot = variantNameSnapshot;
        this.unitPriceSnapshot = unitPriceSnapshot;
        this.quantity = quantity;
        this.lineTotal = lineTotal;
        this.optionsSnapshot = optionsSnapshot != null ? optionsSnapshot : "{}";
        this.addonsSnapshot = addonsSnapshot != null ? addonsSnapshot : "{}";
        this.customDetailsSnapshot = customDetailsSnapshot != null ? customDetailsSnapshot : "{}";
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public Order getOrder() { return order; }
    public void setOrder(Order order) { this.order = order; }
    public UUID getProductId() { return productId; }
    public void setProductId(UUID productId) { this.productId = productId; }
    public UUID getVariantId() { return variantId; }
    public void setVariantId(UUID variantId) { this.variantId = variantId; }
    public String getProductNameSnapshot() { return productNameSnapshot; }
    public void setProductNameSnapshot(String productNameSnapshot) { this.productNameSnapshot = productNameSnapshot; }
    public String getVariantNameSnapshot() { return variantNameSnapshot; }
    public void setVariantNameSnapshot(String variantNameSnapshot) { this.variantNameSnapshot = variantNameSnapshot; }
    public BigDecimal getUnitPriceSnapshot() { return unitPriceSnapshot; }
    public void setUnitPriceSnapshot(BigDecimal unitPriceSnapshot) { this.unitPriceSnapshot = unitPriceSnapshot; }
    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
    public BigDecimal getLineTotal() { return lineTotal; }
    public void setLineTotal(BigDecimal lineTotal) { this.lineTotal = lineTotal; }
    public String getOptionsSnapshot() { return optionsSnapshot; }
    public void setOptionsSnapshot(String optionsSnapshot) { this.optionsSnapshot = optionsSnapshot; }
    public String getAddonsSnapshot() { return addonsSnapshot; }
    public void setAddonsSnapshot(String addonsSnapshot) { this.addonsSnapshot = addonsSnapshot; }
    public String getCustomDetailsSnapshot() { return customDetailsSnapshot; }
    public void setCustomDetailsSnapshot(String customDetailsSnapshot) { this.customDetailsSnapshot = customDetailsSnapshot; }
}
