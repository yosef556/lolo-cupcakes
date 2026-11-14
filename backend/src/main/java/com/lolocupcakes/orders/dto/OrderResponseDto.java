package com.lolocupcakes.orders.dto;

import com.lolocupcakes.orders.model.Order;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record OrderResponseDto(
    UUID id,
    String publicOrderNumber,
    String trackingToken,
    String orderStatus,
    String orderStatusLabelAr,
    String paymentStatus,
    String paymentStatusLabelAr,
    String paymentMethod,
    String paymentMethodLabelAr,
    String fulfillmentType,
    String fulfillmentTypeLabelAr,
    LocalDate scheduledForDate,
    String scheduledForTimeRange,
    String customerName,
    String customerPhone,
    BigDecimal subtotal,
    BigDecimal discountAmount,
    BigDecimal deliveryFee,
    BigDecimal totalAmount,
    String currency,
    String deliveryAddressSnapshot,
    String customerNotes,
    List<OrderItemResponseDto> items,
    Instant createdAt,
    UUID customerId,
    Boolean isGuest
) {
    public static OrderResponseDto fromEntity(Order order) {
        List<OrderItemResponseDto> itemDtos = order.getItems() == null ? List.of() :
            order.getItems().stream().map(OrderItemResponseDto::fromEntity).toList();

        return new OrderResponseDto(
            order.getId(),
            order.getPublicOrderNumber(),
            order.getTrackingToken(),
            order.getOrderStatus().name(),
            order.getOrderStatus().getLabelAr(),
            order.getPaymentStatus().name(),
            order.getPaymentStatus().getLabelAr(),
            order.getPaymentMethod().name(),
            order.getPaymentMethod().getLabelAr(),
            order.getFulfillmentType().name(),
            order.getFulfillmentType().getLabelAr(),
            order.getScheduledForDate(),
            order.getScheduledForTimeRange(),
            order.getCustomerName(),
            order.getCustomerPhone(),
            order.getSubtotal(),
            order.getDiscountAmount(),
            order.getDeliveryFee(),
            order.getTotalAmount(),
            order.getCurrency(),
            order.getDeliveryAddressSnapshot(),
            order.getCustomerNotes(),
            itemDtos,
            order.getCreatedAt(),
            order.getCustomerId(),
            order.getCustomerId() == null
        );
    }
}
