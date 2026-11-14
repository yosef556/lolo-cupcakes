package com.lolocupcakes.orders.controller;

import com.lolocupcakes.common.ApiResponse;
import com.lolocupcakes.orders.dto.PaymentInstructionDto;
import com.lolocupcakes.orders.dto.PaymentProofResponseDto;
import com.lolocupcakes.orders.service.PaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
@Tag(name = "Payments", description = "واجهات تعليمات الدفع ورفع إثباتات السداد للعملاء")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @GetMapping("/payment-instructions")
    @Operation(summary = "عرض تعليمات وطرق الدفع المعتمدة (إنستاباي، فودافون كاش، تحويل بنكي، كاش)")
    public ResponseEntity<ApiResponse<List<PaymentInstructionDto>>> getPaymentInstructions() {
        List<PaymentInstructionDto> instructions = paymentService.getPaymentInstructions();
        return ResponseEntity.ok(ApiResponse.success(instructions));
    }

    @PostMapping(value = "/orders/{publicOrderNumber}/manual-payment-proofs", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "رفع إيصال سداد يدوي للطلب مع التحقق من نوع وحجم الملف ورمز التتبع")
    public ResponseEntity<ApiResponse<PaymentProofResponseDto>> uploadPaymentProof(
        @PathVariable String publicOrderNumber,
        @RequestParam("token") String trackingToken,
        @RequestParam("file") MultipartFile file,
        @RequestParam(value = "senderPhone", required = false) String senderPhone,
        @RequestParam(value = "senderName", required = false) String senderName,
        @RequestParam(value = "transactionRef", required = false) String transactionRef
    ) {
        PaymentProofResponseDto proof = paymentService.uploadPaymentProof(
            publicOrderNumber,
            trackingToken,
            file,
            senderPhone,
            senderName,
            transactionRef
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(
            ApiResponse.success(proof, "تم استلام إيصال السداد بنجاح وبانتظار المراجعة والاعتماد")
        );
    }
}
