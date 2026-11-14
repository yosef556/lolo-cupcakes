package com.lolocupcakes.orders.dto;

import java.time.LocalDate;

public record RescheduleOrderRequest(
    LocalDate newDate,
    String newTimeSlotId,
    String note
) {}
