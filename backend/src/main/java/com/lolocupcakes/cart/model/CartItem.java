package com.lolocupcakes.cart.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.lolocupcakes.catalog.model.Product;
import com.lolocupcakes.catalog.model.ProductVariant;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "cart_items")
public class CartItem {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cart_id", nullable = false)
    @JsonIgnore
    private Cart cart;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "variant_id")
    private ProductVariant variant;

    @Column(name = "quantity", nullable = false)
    private Integer quantity = 1;

    @org.hibernate.annotations.JdbcTypeCode(org.hibernate.type.SqlTypes.JSON)
    @Column(name = "selected_configuration", nullable = false)
    private String selectedConfiguration = "{}";

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    public CartItem() {}

    public CartItem(Cart cart, Product product, ProductVariant variant, Integer quantity, String selectedConfiguration) {
        this.cart = cart;
        this.product = product;
        this.variant = variant;
        this.quantity = quantity;
        this.selectedConfiguration = selectedConfiguration != null ? selectedConfiguration : "{}";
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = Instant.now();
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public Cart getCart() { return cart; }
    public void setCart(Cart cart) { this.cart = cart; }
    public Product getProduct() { return product; }
    public void setProduct(Product product) { this.product = product; }
    public ProductVariant getVariant() { return variant; }
    public void setVariant(ProductVariant variant) { this.variant = variant; }
    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
    public String getSelectedConfiguration() { return selectedConfiguration; }
    public void setSelectedConfiguration(String selectedConfiguration) { this.selectedConfiguration = selectedConfiguration; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
}
