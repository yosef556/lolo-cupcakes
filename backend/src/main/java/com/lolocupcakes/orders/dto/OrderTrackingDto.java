package com.lolocupcakes.orders.dto;

import com.lolocupcakes.orders.model.Order;
import com.lolocupcakes.orders.model.OrderStatus;
import com.lolocupcakes.orders.model.OrderStatusHistory;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

public record OrderTrackingDto(
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
    List<TrackingTimelineEvent> timeline
) {
    public record TrackingTimelineEvent(
        String status,
        String statusLabelAr,
        String note,
        Instant timestamp
    ) {}

    public static OrderTrackingDto fromEntity(Order order, List<OrderStatusHistory> history) {
        List<TrackingTimelineEvent> timeline = history.stream()
            .map(h -> new TrackingTimelineEvent(
                h.getNewStatus(),
                tryGetLabel(h.getNewStatus()),
                h.getNote(),
                h.getCreatedAt()
            ))
            .toList();

        List<OrderItemResponseDto> itemDtos = order.getItems() == null ? List.of() :
            order.getItems().stream().map(OrderItemResponseDto::fromEntity).toList();

        return new OrderTrackingDto(
            order.getPublicOrderNumber(),
            order.getTrackingToken(),
            order.getOrderStatus().name(),
            order.getOrderStatus().getLabelAr(),
            order.getPaymentStatus().name(),
            order.getPaymentStatus().getLabelAr(),
            order.getPaymentMethod() != null ? order.getPaymentMethod().name() : "CASH",
            order.getPaymentMethod() != null ? order.getPaymentMethod().getLabelAr() : "الدفع نقداً",
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
            timeline
        );
    }

    private static String tryGetLabel(String statusStr) {
        try {
            return OrderStatus.valueOf(statusStr).getLabelAr();
        } catch (Exception e) {
            return statusStr;
        }
    }
}
