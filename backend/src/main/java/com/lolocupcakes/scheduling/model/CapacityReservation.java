package com.lolocupcakes.scheduling.model;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "capacity_reservations")
public class CapacityReservation {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "time_slot_id", nullable = false)
    private UUID timeSlotId;

    @Column(name = "order_id", nullable = false, unique = true)
    private UUID orderId;

    @Column(name = "reserved_count", nullable = false)
    private Integer reservedCount = 1;

    @Column(name = "status", nullable = false)
    private String status = "CONFIRMED";

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public CapacityReservation() {}

    public CapacityReservation(UUID timeSlotId, UUID orderId, Integer reservedCount) {
        this.timeSlotId = timeSlotId;
        this.orderId = orderId;
        this.reservedCount = reservedCount;
        this.status = "CONFIRMED";
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getTimeSlotId() { return timeSlotId; }
    public void setTimeSlotId(UUID timeSlotId) { this.timeSlotId = timeSlotId; }
    public UUID getOrderId() { return orderId; }
    public void setOrderId(UUID orderId) { this.orderId = orderId; }
    public Integer getReservedCount() { return reservedCount; }
    public void setReservedCount(Integer reservedCount) { this.reservedCount = reservedCount; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Instant getCreatedAt() { return createdAt; }
}
