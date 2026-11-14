package com.lolocupcakes.customcakes.model;

import jakarta.persistence.*;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "custom_cake_requests")
public class CustomCakeRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "public_reference", nullable = false, unique = true)
    private String publicReference;

    @Column(name = "access_token", nullable = false, unique = true)
    private String accessToken;

    @Column(name = "customer_name", nullable = false)
    private String customerName;

    @Column(name = "customer_phone", nullable = false)
    private String customerPhone;

    @Column(name = "customer_email")
    private String customerEmail;

    @Column(name = "requested_date", nullable = false)
    private LocalDate requestedDate;

    @Column(name = "servings_needed")
    private Integer servingsNeeded;

    @Column(name = "flavor_preference")
    private String flavorPreference;

    @Column(name = "message_on_cake")
    private String messageOnCake;

    @Column(name = "notes")
    private String notes;

    @Column(name = "reference_image_storage_key")
    private String referenceImageStorageKey;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private CustomCakeStatus status = CustomCakeStatus.SUBMITTED;

    @OneToMany(mappedBy = "request", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("createdAt DESC")
    private List<CustomCakeQuote> quotes = new ArrayList<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    public CustomCakeRequest() {}

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = Instant.now();
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getPublicReference() { return publicReference; }
    public void setPublicReference(String publicReference) { this.publicReference = publicReference; }
    public String getAccessToken() { return accessToken; }
    public void setAccessToken(String accessToken) { this.accessToken = accessToken; }
    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }
    public String getCustomerPhone() { return customerPhone; }
    public void setCustomerPhone(String customerPhone) { this.customerPhone = customerPhone; }
    public String getCustomerEmail() { return customerEmail; }
    public void setCustomerEmail(String customerEmail) { this.customerEmail = customerEmail; }
    public LocalDate getRequestedDate() { return requestedDate; }
    public void setRequestedDate(LocalDate requestedDate) { this.requestedDate = requestedDate; }
    public Integer getServingsNeeded() { return servingsNeeded; }
    public void setServingsNeeded(Integer servingsNeeded) { this.servingsNeeded = servingsNeeded; }
    public String getFlavorPreference() { return flavorPreference; }
    public void setFlavorPreference(String flavorPreference) { this.flavorPreference = flavorPreference; }
    public String getMessageOnCake() { return messageOnCake; }
    public void setMessageOnCake(String messageOnCake) { this.messageOnCake = messageOnCake; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public String getReferenceImageStorageKey() { return referenceImageStorageKey; }
    public void setReferenceImageStorageKey(String referenceImageStorageKey) { this.referenceImageStorageKey = referenceImageStorageKey; }
    public CustomCakeStatus getStatus() { return status; }
    public void setStatus(CustomCakeStatus status) { this.status = status; }
    public List<CustomCakeQuote> getQuotes() { return quotes; }
    public void setQuotes(List<CustomCakeQuote> quotes) { this.quotes = quotes; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
}
