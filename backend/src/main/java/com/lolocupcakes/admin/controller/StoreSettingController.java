package com.lolocupcakes.admin.controller;

import com.lolocupcakes.admin.dto.StoreSettingDto;
import com.lolocupcakes.admin.service.StoreSettingService;
import com.lolocupcakes.common.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1")
@Tag(name = "Settings", description = "إعدادات المتجر العامة والإدارية")
public class StoreSettingController {

    private final StoreSettingService settingService;

    public StoreSettingController(StoreSettingService settingService) {
        this.settingService = settingService;
    }

    @GetMapping("/settings")
    @Operation(summary = "عرض إعدادات المتجر العامة (الهاتف، الواتساب، ساعات العمل، اسم المتجر)")
    public ResponseEntity<ApiResponse<Map<String, String>>> getPublicSettings() {
        Map<String, String> settings = settingService.getPublicSettings();
        return ResponseEntity.ok(ApiResponse.success(settings));
    }

    @GetMapping("/admin/settings")
    @Operation(summary = "عرض جميع إعدادات المتجر للإدارة")
    public ResponseEntity<ApiResponse<List<StoreSettingDto>>> getAllSettings() {
        List<StoreSettingDto> settings = settingService.getAllSettings();
        return ResponseEntity.ok(ApiResponse.success(settings));
    }

    @PutMapping("/admin/settings/{key}")
    @Operation(summary = "تحديث قيمة إعداد معين في المتجر")
    public ResponseEntity<ApiResponse<StoreSettingDto>> updateSetting(
        @PathVariable String key,
        @RequestBody Map<String, String> body
    ) {
        String value = body.getOrDefault("value", "");
        StoreSettingDto updated = settingService.updateSetting(key, value);
        return ResponseEntity.ok(ApiResponse.success(updated, "تم تحديث الإعداد بنجاح"));
    }
}
