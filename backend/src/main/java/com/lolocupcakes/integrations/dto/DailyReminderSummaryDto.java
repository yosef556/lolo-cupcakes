package com.lolocupcakes.integrations.dto;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record DailyReminderSummaryDto(
    LocalDate targetDate,
    int totalOrdersDue,
    String chefWhatsAppMessage,
    List<CustomerReminderItem> customerReminders
) {
    public record CustomerReminderItem(
        UUID orderId,
        String publicOrderNumber,
        String customerName,
        String customerPhone,
        String timeRange,
        String fulfillmentType,
        String customerWhatsAppMessage
    ) {}
}
