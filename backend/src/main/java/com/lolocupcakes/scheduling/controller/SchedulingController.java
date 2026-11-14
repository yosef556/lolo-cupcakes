package com.lolocupcakes.scheduling.controller;

import com.lolocupcakes.common.ApiResponse;
import com.lolocupcakes.scheduling.dto.TimeSlotAvailabilityDto;
import com.lolocupcakes.scheduling.model.Branch;
import com.lolocupcakes.scheduling.service.SchedulingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1")
@Tag(name = "Scheduling & Availability", description = "فحص الفترات الزمنية المتاحة وجدولة التوصيل والاستلام")
public class SchedulingController {

    private final SchedulingService schedulingService;

    public SchedulingController(SchedulingService schedulingService) {
        this.schedulingService = schedulingService;
    }

    @GetMapping("/availability/slots")
    @Operation(summary = "جلب الفترات المتاحة لتاريخ معين ونوع استلام وتوصيل مع فحص السعة")
    public ApiResponse<List<TimeSlotAvailabilityDto>> getAvailableSlots(
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
        @RequestParam(required = false, defaultValue = "BOTH") String fulfillmentType,
        @RequestParam(required = false, defaultValue = "2") Integer leadTimeHours
    ) {
        return ApiResponse.ok(schedulingService.getAvailableSlots(date, fulfillmentType, leadTimeHours));
    }

    @GetMapping("/branches/current")
    @Operation(summary = "معلومات الفرع التشغيلي ومواعيده")
    public ApiResponse<Branch> getCurrentBranch() {
        return ApiResponse.ok(schedulingService.getCurrentBranch());
    }
}
