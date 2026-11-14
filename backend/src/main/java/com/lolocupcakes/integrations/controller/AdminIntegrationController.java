package com.lolocupcakes.integrations.controller;

import com.lolocupcakes.common.ApiResponse;
import com.lolocupcakes.integrations.dto.DailyReminderSummaryDto;
import com.lolocupcakes.integrations.service.AutomationIntegrationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/integrations")
@Tag(name = "Admin Integrations & Automation", description = "خدمات الربط التلقائي مع n8n وفيسبوك وتذكيرات الواتساب للشيف والعملاء")
public class AdminIntegrationController {

    private final AutomationIntegrationService integrationService;

    public AdminIntegrationController(AutomationIntegrationService integrationService) {
        this.integrationService = integrationService;
    }

    @PostMapping("/n8n/publish-product/{productId}")
    @Operation(summary = "نشر صنف جديد على فيسبوك تلقائياً عبر منصة n8n")
    public ResponseEntity<ApiResponse<Map<String, Object>>> publishProductToN8n(@PathVariable UUID productId) {
        Map<String, Object> result = integrationService.publishProductToN8n(productId);
        return ResponseEntity.ok(ApiResponse.success(result, "تم إرسال إشعار النشر التلقائي عبر n8n بنجاح"));
    }

    @GetMapping("/reminders")
    @Operation(summary = "تجهيز خطة تذكيرات اليوم للشيف ورسائل العملاء الجاهزة للواتساب")
    public ResponseEntity<ApiResponse<DailyReminderSummaryDto>> getDailyReminders(
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        DailyReminderSummaryDto summary = integrationService.getDailyReminders(date);
        return ResponseEntity.ok(ApiResponse.success(summary, "تم استخراج قائمة التذكيرات بنجاح"));
    }
}
