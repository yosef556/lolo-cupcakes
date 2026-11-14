package com.lolocupcakes.orders.dto;

import com.lolocupcakes.orders.model.OrderStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateOrderStatusRequest(
    @NotNull(message = "الحالة الجديدة مطلوبة")
    OrderStatus newStatus,
    String note
) {}
