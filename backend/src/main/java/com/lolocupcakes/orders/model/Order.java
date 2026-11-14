package com.lolocupcakes.orders.model;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "orders")
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "public_order_number", nullable = false, unique = true)
    private String publicOrderNumber;

    @Column(name = "tracking_token", nullable = false, unique = true)
    private String trackingToken;

    @Column(name = "idempotency_key", nullable = false, unique = true)
    private String idempotencyKey;

    @Column(name = "customer_id")
    private UUID customerId;

    @Column(name = "customer_name", nullable = false)
    private String customerName;

    @Column(name = "customer_phone", nullable = false)
    private String customerPhone;

    @Enumerated(EnumType.STRING)
    @Column(name = "fulfillment_type", nullable = false)
    private FulfillmentType fulfillmentType;

    @Column(name = "branch_id")
    private UUID branchId;

    @Column(name = "delivery_zone_id")
    private UUID deliveryZoneId;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "delivery_address_snapshot")
    private String deliveryAddressSnapshot;

    @Column(name = "time_slot_id", nullable = false)
    private UUID timeSlotId;

    @Column(name = "scheduled_for_date", nullable = false)
    private LocalDate scheduledForDate;

    @Column(name = "scheduled_for_time_range", nullable = false)
    private String scheduledForTimeRange;

    @Column(name = "subtotal", nullable = false)
    private BigDecimal subtotal;

    @Column(name = "discount_amount", nullable = false)
    private BigDecimal discountAmount = BigDecimal.ZERO;

    @Column(name = "delivery_fee", nullable = false)
    private BigDecimal deliveryFee = BigDecimal.ZERO;

    @Column(name = "total_amount", nullable = false)
    private BigDecimal totalAmount;

    @Column(name = "currency", nullable = false)
    private String currency = "EGP";

    @Enumerated(EnumType.STRING)
    @Column(name = "order_status", nullable = false)
    private OrderStatus orderStatus = OrderStatus.PENDING;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status", nullable = false)
    private PaymentStatus paymentStatus = PaymentStatus.UNPAID;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method", nullable = false)
    private PaymentMethod paymentMethod;

    @Column(name = "customer_notes")
    private String customerNotes;

    @Column(name = "admin_notes")
    private String adminNotes;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<OrderItem> items = new ArrayList<>();

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("createdAt DESC")
    private List<OrderStatusHistory> history = new ArrayList<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    public Order() {}

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = Instant.now();
    }

    // Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getPublicOrderNumber() { return publicOrderNumber; }
    public void setPublicOrderNumber(String publicOrderNumber) { this.publicOrderNumber = publicOrderNumber; }
    public String getTrackingToken() { return trackingToken; }
    public void setTrackingToken(String trackingToken) { this.trackingToken = trackingToken; }
    public String getIdempotencyKey() { return idempotencyKey; }
    public void setIdempotencyKey(String idempotencyKey) { this.idempotencyKey = idempotencyKey; }
    public UUID getCustomerId() { return customerId; }
    public void setCustomerId(UUID customerId) { this.customerId = customerId; }
    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }
    public String getCustomerPhone() { return customerPhone; }
    public void setCustomerPhone(String customerPhone) { this.customerPhone = customerPhone; }
    public FulfillmentType getFulfillmentType() { return fulfillmentType; }
    public void setFulfillmentType(FulfillmentType fulfillmentType) { this.fulfillmentType = fulfillmentType; }
    public UUID getBranchId() { return branchId; }
    public void setBranchId(UUID branchId) { this.branchId = branchId; }
    public UUID getDeliveryZoneId() { return deliveryZoneId; }
    public void setDeliveryZoneId(UUID deliveryZoneId) { this.deliveryZoneId = deliveryZoneId; }
    public String getDeliveryAddressSnapshot() { return deliveryAddressSnapshot; }
    public void setDeliveryAddressSnapshot(String deliveryAddressSnapshot) { this.deliveryAddressSnapshot = deliveryAddressSnapshot; }
    public UUID getTimeSlotId() { return timeSlotId; }
    public void setTimeSlotId(UUID timeSlotId) { this.timeSlotId = timeSlotId; }
    public LocalDate getScheduledForDate() { return scheduledForDate; }
    public void setScheduledForDate(LocalDate scheduledForDate) { this.scheduledForDate = scheduledForDate; }
    public String getScheduledForTimeRange() { return scheduledForTimeRange; }
    public void setScheduledForTimeRange(String scheduledForTimeRange) { this.scheduledForTimeRange = scheduledForTimeRange; }
    public BigDecimal getSubtotal() { return subtotal; }
    public void setSubtotal(BigDecimal subtotal) { this.subtotal = subtotal; }
    public BigDecimal getDiscountAmount() { return discountAmount; }
    public void setDiscountAmount(BigDecimal discountAmount) { this.discountAmount = discountAmount; }
    public BigDecimal getDeliveryFee() { return deliveryFee; }
    public void setDeliveryFee(BigDecimal deliveryFee) { this.deliveryFee = deliveryFee; }
    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }
    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }
    public OrderStatus getOrderStatus() { return orderStatus; }
    public void setOrderStatus(OrderStatus orderStatus) { this.orderStatus = orderStatus; }
    public PaymentStatus getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(PaymentStatus paymentStatus) { this.paymentStatus = paymentStatus; }
    public PaymentMethod getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(PaymentMethod paymentMethod) { this.paymentMethod = paymentMethod; }
    public String getCustomerNotes() { return customerNotes; }
    public void setCustomerNotes(String customerNotes) { this.customerNotes = customerNotes; }
    public String getAdminNotes() { return adminNotes; }
    public void setAdminNotes(String adminNotes) { this.adminNotes = adminNotes; }
    public List<OrderItem> getItems() { return items; }
    public void setItems(List<OrderItem> items) { this.items = items; }
    public List<OrderStatusHistory> getHistory() { return history; }
    public void setHistory(List<OrderStatusHistory> history) { this.history = history; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
}
