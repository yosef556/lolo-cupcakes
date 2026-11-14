package com.lolocupcakes.admin.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record CustomerAdminDto(
    UUID id,
    String fullName,
    String email,
    String phone,
    String status,
    boolean isAdmin,
    String avatarUrl,
    String address,
    Instant createdAt,
    int totalOrders,
    BigDecimal totalSpent
) {}
