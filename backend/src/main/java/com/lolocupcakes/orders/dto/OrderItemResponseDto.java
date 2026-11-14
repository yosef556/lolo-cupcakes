package com.lolocupcakes.orders.dto;

import com.lolocupcakes.orders.model.OrderItem;
import java.math.BigDecimal;
import java.util.UUID;

public record OrderItemResponseDto(
    UUID id,
    String productName,
    String variantName,
    BigDecimal unitPrice,
    Integer quantity,
    BigDecimal lineTotal,
    String options
) {
    public static OrderItemResponseDto fromEntity(OrderItem item) {
        return new OrderItemResponseDto(
            item.getId(),
            item.getProductNameSnapshot(),
            item.getVariantNameSnapshot(),
            item.getUnitPriceSnapshot(),
            item.getQuantity(),
            item.getLineTotal(),
            item.getOptionsSnapshot()
        );
    }
}
