package com.lolocupcakes.orders.controller;

import com.lolocupcakes.common.ApiResponse;
import com.lolocupcakes.orders.dto.PaymentProofResponseDto;
import com.lolocupcakes.orders.dto.PaymentResponseDto;
import com.lolocupcakes.orders.dto.PaymentReviewRequest;
import com.lolocupcakes.orders.service.PaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/payments")
@Tag(name = "Admin Payments", description = "مراجعة واعتماد أو رفض مدفوعات التحويل اليدوي")
public class AdminPaymentController {

    private final PaymentService paymentService;

    public AdminPaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @GetMapping
    @Operation(summary = "عرض سجلات الدفع للإدارة مع إمكانية التصفية بالحالة")
    public ResponseEntity<ApiResponse<List<PaymentResponseDto>>> getPayments(
        @RequestParam(required = false) String status
    ) {
        List<PaymentResponseDto> payments = paymentService.getPayments(status);
        return ResponseEntity.ok(ApiResponse.success(payments));
    }

    @GetMapping("/{id}")
    @Operation(summary = "عرض تفاصيل سجل دفع وإيصالاته")
    public ResponseEntity<ApiResponse<PaymentResponseDto>> getPaymentById(@PathVariable UUID id) {
        PaymentResponseDto payment = paymentService.getPaymentById(id);
        return ResponseEntity.ok(ApiResponse.success(payment));
    }

    @PostMapping("/{id}/approve")
    @Operation(summary = "اعتماد سداد الطلب وتحديث حالة الدفع والطلب وتوثيق التدقيق")
    public ResponseEntity<ApiResponse<PaymentResponseDto>> approvePayment(
        @PathVariable UUID id,
        @Valid @RequestBody(required = false) PaymentReviewRequest request,
        @RequestHeader(value = "X-Admin-User-Id", required = false) UUID adminUserId
    ) {
        String note = request != null ? request.note() : null;
        PaymentResponseDto result = paymentService.approvePayment(id, adminUserId, note);
        return ResponseEntity.ok(ApiResponse.success(result, "تم اعتماد السداد بنجاح"));
    }

    @PostMapping("/{id}/reject")
    @Operation(summary = "رفض إيصال السداد مع توضيح سبب الرفض")
    public ResponseEntity<ApiResponse<PaymentResponseDto>> rejectPayment(
        @PathVariable UUID id,
        @Valid @RequestBody PaymentReviewRequest request,
        @RequestHeader(value = "X-Admin-User-Id", required = false) UUID adminUserId
    ) {
        PaymentResponseDto result = paymentService.rejectPayment(id, adminUserId, request.note());
        return ResponseEntity.ok(ApiResponse.success(result, "تم تسجيل رفض إيصال السداد"));
    }

    @GetMapping("/proofs/{proofId}/file")
    @Operation(summary = "تحميل أو معاينة ملف إيصال السداد المخزن في المجلد الخاص")
    public ResponseEntity<Resource> getProofFile(@PathVariable UUID proofId) {
        Map.Entry<Resource, String> fileEntry = paymentService.getProofFile(proofId);
        return ResponseEntity.ok()
            .contentType(MediaType.parseMediaType(fileEntry.getValue()))
            .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + fileEntry.getKey().getFilename() + "\"")
            .body(fileEntry.getKey());
    }
}
