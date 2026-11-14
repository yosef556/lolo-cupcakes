package com.lolocupcakes.orders.model;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "payment_proofs")
public class PaymentProof {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "payment_id", nullable = false)
    private UUID paymentId;

    @Column(name = "storage_key", nullable = false)
    private String storageKey;

    @Column(name = "original_filename")
    private String originalFilename;

    @Column(name = "file_size")
    private Integer fileSize;

    @Column(name = "mime_type")
    private String mimeType;

    @Column(name = "uploaded_at", nullable = false, updatable = false)
    private Instant uploadedAt = Instant.now();

    public PaymentProof() {}

    public PaymentProof(UUID paymentId, String storageKey, String originalFilename, Integer fileSize, String mimeType) {
        this.paymentId = paymentId;
        this.storageKey = storageKey;
        this.originalFilename = originalFilename;
        this.fileSize = fileSize;
        this.mimeType = mimeType;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getPaymentId() { return paymentId; }
    public void setPaymentId(UUID paymentId) { this.paymentId = paymentId; }
    public String getStorageKey() { return storageKey; }
    public void setStorageKey(String storageKey) { this.storageKey = storageKey; }
    public String getOriginalFilename() { return originalFilename; }
    public void setOriginalFilename(String originalFilename) { this.originalFilename = originalFilename; }
    public Integer getFileSize() { return fileSize; }
    public void setFileSize(Integer fileSize) { this.fileSize = fileSize; }
    public String getMimeType() { return mimeType; }
    public void setMimeType(String mimeType) { this.mimeType = mimeType; }
    public Instant getUploadedAt() { return uploadedAt; }
}
