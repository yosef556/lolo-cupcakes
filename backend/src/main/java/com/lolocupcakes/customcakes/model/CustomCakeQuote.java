package com.lolocupcakes.customcakes.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "custom_cake_quotes")
public class CustomCakeQuote {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "request_id", nullable = false)
    private CustomCakeRequest request;

    @Column(name = "quoted_price", nullable = false)
    private BigDecimal quotedPrice;

    @Column(name = "terms_and_details", nullable = false)
    private String termsAndDetails;

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private QuoteStatus status = QuoteStatus.PENDING;

    @Column(name = "created_by_user_id", nullable = false)
    private UUID createdByUserId;

    @Column(name = "responded_at")
    private Instant respondedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public CustomCakeQuote() {}

    public CustomCakeQuote(CustomCakeRequest request, BigDecimal quotedPrice, String termsAndDetails, Instant expiresAt, UUID createdByUserId) {
        this.request = request;
        this.quotedPrice = quotedPrice;
        this.termsAndDetails = termsAndDetails;
        this.expiresAt = expiresAt;
        this.createdByUserId = createdByUserId;
        this.status = QuoteStatus.PENDING;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public CustomCakeRequest getRequest() { return request; }
    public void setRequest(CustomCakeRequest request) { this.request = request; }
    public BigDecimal getQuotedPrice() { return quotedPrice; }
    public void setQuotedPrice(BigDecimal quotedPrice) { this.quotedPrice = quotedPrice; }
    public String getTermsAndDetails() { return termsAndDetails; }
    public void setTermsAndDetails(String termsAndDetails) { this.termsAndDetails = termsAndDetails; }
    public Instant getExpiresAt() { return expiresAt; }
    public void setExpiresAt(Instant expiresAt) { this.expiresAt = expiresAt; }
    public QuoteStatus getStatus() { return status; }
    public void setStatus(QuoteStatus status) { this.status = status; }
    public UUID getCreatedByUserId() { return createdByUserId; }
    public void setCreatedByUserId(UUID createdByUserId) { this.createdByUserId = createdByUserId; }
    public Instant getRespondedAt() { return respondedAt; }
    public void setRespondedAt(Instant respondedAt) { this.respondedAt = respondedAt; }
    public Instant getCreatedAt() { return createdAt; }
}
