package com.lolocupcakes.customcakes.controller;

import com.lolocupcakes.common.ApiResponse;
import com.lolocupcakes.customcakes.dto.CreateCustomCakeRequestDto;
import com.lolocupcakes.customcakes.dto.CustomCakeRequestResponseDto;
import com.lolocupcakes.customcakes.service.CustomCakeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/custom-cake-requests")
@Tag(name = "Custom Cakes", description = "واجهات تقديم ومتابعة طلبات التورتات الخاصة وعروض الأسعار")
public class CustomCakeController {

    private final CustomCakeService customCakeService;

    public CustomCakeController(CustomCakeService customCakeService) {
        this.customCakeService = customCakeService;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "تقديم طلب تصميم تورتة خاصة مع إمكانية إرفاق صورة مرجعية")
    public ResponseEntity<ApiResponse<CustomCakeRequestResponseDto>> createRequest(
        @RequestPart("data") @Valid CreateCustomCakeRequestDto dto,
        @RequestPart(value = "referenceImage", required = false) MultipartFile referenceImage
    ) {
        CustomCakeRequestResponseDto created = customCakeService.createRequest(dto, referenceImage);
        return ResponseEntity.status(HttpStatus.CREATED).body(
            ApiResponse.success(created, "تم استلام طلب التورتة الخاصة بنجاح، سيقوم الشيف بمراجعته وإرسال عرض السعر قريباً")
        );
    }

    @GetMapping("/{publicReference}")
    @Operation(summary = "متابعة حالة طلب التورتة وعروض الأسعار برقم المرجع ورمز الوصول السري")
    public ResponseEntity<ApiResponse<CustomCakeRequestResponseDto>> getRequest(
        @PathVariable String publicReference,
        @RequestParam("token") String token
    ) {
        CustomCakeRequestResponseDto dto = customCakeService.getRequest(publicReference, token);
        return ResponseEntity.ok(ApiResponse.success(dto));
    }

    @PostMapping("/{publicReference}/quotes/{quoteId}/accept")
    @Operation(summary = "قبول عرض السعر المقدم من الإدارة لتأكيد تصميم التورتة")
    public ResponseEntity<ApiResponse<CustomCakeRequestResponseDto>> acceptQuote(
        @PathVariable String publicReference,
        @PathVariable UUID quoteId,
        @RequestParam("token") String token
    ) {
        CustomCakeRequestResponseDto updated = customCakeService.acceptQuote(publicReference, token, quoteId);
        return ResponseEntity.ok(ApiResponse.success(updated, "تم قبول عرض السعر بنجاح"));
    }

    @PostMapping("/{publicReference}/quotes/{quoteId}/decline")
    @Operation(summary = "رفض عرض السعر المقدم")
    public ResponseEntity<ApiResponse<CustomCakeRequestResponseDto>> declineQuote(
        @PathVariable String publicReference,
        @PathVariable UUID quoteId,
        @RequestParam("token") String token
    ) {
        CustomCakeRequestResponseDto updated = customCakeService.declineQuote(publicReference, token, quoteId);
        return ResponseEntity.ok(ApiResponse.success(updated, "تم تسجيل رفض عرض السعر"));
    }
}
