package com.lolocupcakes.customcakes.controller;

import com.lolocupcakes.common.ApiResponse;
import com.lolocupcakes.customcakes.dto.CustomCakeRequestResponseDto;
import com.lolocupcakes.customcakes.dto.SubmitQuoteRequestDto;
import com.lolocupcakes.customcakes.model.CustomCakeStatus;
import com.lolocupcakes.customcakes.service.CustomCakeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/custom-cake-requests")
@Tag(name = "Admin Custom Cakes", description = "إدارة طلبات التورتات الخاصة وإصدار عروض الأسعار")
public class AdminCustomCakeController {

    private final CustomCakeService customCakeService;

    public AdminCustomCakeController(CustomCakeService customCakeService) {
        this.customCakeService = customCakeService;
    }

    @GetMapping
    @Operation(summary = "عرض قائمة طلبات التورتات الخاصة مع إمكانية التصفية بالحالة")
    public ResponseEntity<ApiResponse<Page<CustomCakeRequestResponseDto>>> getRequests(
        @RequestParam(required = false) CustomCakeStatus status,
        @PageableDefault(size = 20) Pageable pageable
    ) {
        Page<CustomCakeRequestResponseDto> requests = customCakeService.adminGetRequests(status, pageable);
        return ResponseEntity.ok(ApiResponse.success(requests));
    }

    @GetMapping("/{id}")
    @Operation(summary = "عرض تفاصيل طلب التورتة وتاريخ عروض الأسعار")
    public ResponseEntity<ApiResponse<CustomCakeRequestResponseDto>> getRequestById(@PathVariable UUID id) {
        CustomCakeRequestResponseDto request = customCakeService.adminGetRequestById(id);
        return ResponseEntity.ok(ApiResponse.success(request));
    }

    @PostMapping("/{id}/quote")
    @Operation(summary = "إصدار عرض سعر فني ومحدد بوقت للعميل")
    public ResponseEntity<ApiResponse<CustomCakeRequestResponseDto>> submitQuote(
        @PathVariable UUID id,
        @Valid @RequestBody SubmitQuoteRequestDto dto,
        @RequestHeader(value = "X-Admin-User-Id", required = false) UUID adminUserId
    ) {
        CustomCakeRequestResponseDto response = customCakeService.adminSubmitQuote(id, dto, adminUserId);
        return ResponseEntity.ok(ApiResponse.success(response, "تم إرسال عرض السعر للعميل بنجاح"));
    }

    @GetMapping("/{id}/reference-image")
    @Operation(summary = "معاينة أو تحميل الصورة المرجعية المرفقة من العميل")
    public ResponseEntity<Resource> getReferenceImage(@PathVariable UUID id) {
        Map.Entry<Resource, String> image = customCakeService.getReferenceImageFile(id);
        return ResponseEntity.ok()
            .contentType(MediaType.parseMediaType(image.getValue()))
            .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + image.getKey().getFilename() + "\"")
            .body(image.getKey());
    }
}
