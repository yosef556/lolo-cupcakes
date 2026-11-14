package com.lolocupcakes.admin.dto;

import com.lolocupcakes.orders.dto.OrderResponseDto;

import java.math.BigDecimal;
import java.util.List;

public record DashboardMetricsDto(
    long totalOrdersCount,
    long todayOrdersCount,
    long pendingOrdersCount,
    long pendingPaymentsCount,
    long pendingCustomCakesCount,
    BigDecimal totalSalesEgp,
    BigDecimal todaySalesEgp,
    List<OrderResponseDto> recentOrders
) {}
