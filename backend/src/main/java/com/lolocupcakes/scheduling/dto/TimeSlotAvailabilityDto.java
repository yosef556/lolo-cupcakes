package com.lolocupcakes.scheduling.dto;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

public record TimeSlotAvailabilityDto(
    UUID id,
    LocalDate slotDate,
    LocalTime startTime,
    LocalTime endTime,
    String timeRangeDisplay,
    String fulfillmentType,
    int maxCapacity,
    int reservedCount,
    int remainingCapacity,
    boolean isAvailable
) {}
