package com.lolocupcakes.admin.controller;

import com.lolocupcakes.admin.dto.AuditLogDto;
import com.lolocupcakes.admin.dto.DashboardMetricsDto;
import com.lolocupcakes.admin.service.AdminDashboardService;
import com.lolocupcakes.admin.service.AuditLogService;
import com.lolocupcakes.common.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.lolocupcakes.admin.dto.CustomerAdminDto;
import com.lolocupcakes.auth.service.AuthService;
import java.util.List;

@RestController
@RequestMapping("/api/v1/admin")
@Tag(name = "Admin Dashboard", description = "لوحة تحكم الإدارة والإحصائيات وسجلات التدقيق")
public class AdminDashboardController {

    private final AdminDashboardService dashboardService;
    private final AuditLogService auditLogService;
    private final AuthService authService;

    public AdminDashboardController(AdminDashboardService dashboardService, AuditLogService auditLogService, AuthService authService) {
        this.dashboardService = dashboardService;
        this.auditLogService = auditLogService;
        this.authService = authService;
    }

    @GetMapping("/dashboard/metrics")
    @Operation(summary = "إحصائيات ومؤشرات لوحة التحكم المباشرة (الطلبات، المبيعات، المدفوعات، التورتات)")
    public ResponseEntity<ApiResponse<DashboardMetricsDto>> getDashboardMetrics() {
        DashboardMetricsDto metrics = dashboardService.getMetrics();
        return ResponseEntity.ok(ApiResponse.success(metrics));
    }

    @GetMapping("/customers")
    @Operation(summary = "عرض قائمة بجميع العملاء والمستخدمين المسجلين وإحصائيات طلباتهم")
    public ResponseEntity<ApiResponse<List<CustomerAdminDto>>> getCustomers() {
        List<CustomerAdminDto> customers = authService.getAllCustomersForAdmin();
        return ResponseEntity.ok(ApiResponse.success(customers));
    }

    @GetMapping("/audit-logs")
    @Operation(summary = "عرض سجلات تدقيق العمليات مع التصفية والترقيم")
    public ResponseEntity<ApiResponse<Page<AuditLogDto>>> getAuditLogs(
        @PageableDefault(size = 20) Pageable pageable
    ) {
        Page<AuditLogDto> logs = auditLogService.getAuditLogs(pageable);
        return ResponseEntity.ok(ApiResponse.success(logs));
    }
}
