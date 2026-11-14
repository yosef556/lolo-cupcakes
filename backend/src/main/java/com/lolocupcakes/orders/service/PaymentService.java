package com.lolocupcakes.orders.service;

import com.lolocupcakes.common.BusinessException;
import com.lolocupcakes.common.ErrorCode;
import com.lolocupcakes.orders.dto.*;
import com.lolocupcakes.orders.model.*;
import com.lolocupcakes.orders.repository.OrderItemRepository;
import com.lolocupcakes.orders.repository.OrderRepository;
import com.lolocupcakes.orders.repository.OrderStatusHistoryRepository;
import com.lolocupcakes.orders.repository.PaymentProofRepository;
import com.lolocupcakes.orders.repository.PaymentRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.Instant;
import java.util.*;

@Service
@Transactional
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final PaymentProofRepository paymentProofRepository;
    private final OrderRepository orderRepository;
    private final OrderStatusHistoryRepository orderStatusHistoryRepository;
    private final com.lolocupcakes.admin.repository.StoreSettingRepository storeSettingRepository;
    private final Path privateStorageDir;

    public PaymentService(
        PaymentRepository paymentRepository,
        PaymentProofRepository paymentProofRepository,
        OrderRepository orderRepository,
        OrderStatusHistoryRepository orderStatusHistoryRepository,
        com.lolocupcakes.admin.repository.StoreSettingRepository storeSettingRepository,
        @Value("${app.upload.private-dir:uploads/private/proofs}") String uploadDir
    ) {
        this.paymentRepository = paymentRepository;
        this.paymentProofRepository = paymentProofRepository;
        this.orderRepository = orderRepository;
        this.orderStatusHistoryRepository = orderStatusHistoryRepository;
        this.storeSettingRepository = storeSettingRepository;
        this.privateStorageDir = Paths.get(uploadDir).toAbsolutePath().normalize();

        try {
            Files.createDirectories(this.privateStorageDir);
        } catch (IOException e) {
            throw new RuntimeException("تعذر إنشاء مجلد تخزين إيصالات الدفع الخاصة", e);
        }
    }

    @Transactional(readOnly = true)
    public List<PaymentInstructionDto> getPaymentInstructions() {
        String phone = storeSettingRepository.findBySettingKey("store_phone")
            .or(() -> storeSettingRepository.findBySettingKey("contact_phone"))
            .map(com.lolocupcakes.admin.model.StoreSetting::getSettingValue)
            .filter(v -> !v.isBlank())
            .orElse("01069915609");

        String transferNote = storeSettingRepository.findBySettingKey("transfer_instructions")
            .map(com.lolocupcakes.admin.model.StoreSetting::getSettingValue)
            .filter(v -> !v.isBlank())
            .orElse("يرجى التحويل إلى حساب إنستاباي أو المحفظة الإلكترونية على الرقم " + phone + " ورفع صورة إشعار التحويل لتأكيد الطلب.");

        return List.of(
            new PaymentInstructionDto(
                "INSTAPAY",
                "إنستاباي (InstaPay)",
                "تحويل فوري وآمن عبر تطبيق إنستاباي المعتمد من البنك المركزي المصري",
                List.of(
                    new PaymentInstructionDto.InstructionField("عنوان الدفع اللحظي (IPA)", "lolocupcakes@instapay", true),
                    new PaymentInstructionDto.InstructionField("اسم المستفيد", "لولو كب كيك - حلويات راقية", false),
                    new PaymentInstructionDto.InstructionField("رقم الهاتف المرتبط", phone, true)
                ),
                transferNote
            ),
            new PaymentInstructionDto(
                "VODAFONE_CASH",
                "فودافون كاش (Vodafone Cash)",
                "تحويل مباشر عبر محفظة فودافون كاش أو المحافظ الإلكترونية الذكية",
                List.of(
                    new PaymentInstructionDto.InstructionField("رقم المحفظة", phone, true),
                    new PaymentInstructionDto.InstructionField("اسم صاحب المحفظة", "إدارة متجر لولو كب كيك", false)
                ),
                transferNote
            ),
            new PaymentInstructionDto(
                "BANK_TRANSFER",
                "تحويل بنكي (Bank Transfer)",
                "تحويل بنكي مباشر لحساب المؤسسة في البنك الأهلي المصري",
                List.of(
                    new PaymentInstructionDto.InstructionField("اسم البنك", "البنك الأهلي المصري - فرع المعادي", false),
                    new PaymentInstructionDto.InstructionField("اسم الحساب", "شركة لولو كب كيك ذ.م.م", false),
                    new PaymentInstructionDto.InstructionField("رقم الحساب", "1234567890123456", true),
                    new PaymentInstructionDto.InstructionField("رقم الآيبان (IBAN)", "EG3800020001234567890123456", true)
                ),
                "يستغرق التحقق من التحويل البنكي عادة من ساعتين إلى 24 ساعة حسب وقت البنك."
            ),
            new PaymentInstructionDto(
                "CASH",
                "الدفع نقداً",
                "الدفع نقداً بالجنيه المصري عند استلام الطلب من الفرع أو لمندوب التوصيل",
                List.of(
                    new PaymentInstructionDto.InstructionField("العملة المقبولة", "الجنيه المصري (EGP) فقط", false)
                ),
                "يرجى تحضير المبلغ المطلوب بدقة لتسهيل المعاملة."
            )
        );
    }

    public PaymentProofResponseDto uploadPaymentProof(
        String publicOrderNumber,
        String trackingToken,
        MultipartFile file,
        String senderPhone,
        String senderName,
        String transactionRef
    ) {
        Order order = orderRepository.findByPublicOrderNumber(publicOrderNumber)
            .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "الطلب غير موجود"));

        if (trackingToken != null && !trackingToken.isBlank() && !order.getTrackingToken().equals(trackingToken)) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED_ACCESS, "رمز تتبع الطلب غير صحيح");
        }

        if (file == null || file.isEmpty()) {
            throw new BusinessException(ErrorCode.VALIDATION_FAILED, "يجب تحديد ملف الإيصال للرفع");
        }

        // Limit file size to 5MB
        if (file.getSize() > 5 * 1024 * 1024) {
            throw new BusinessException(ErrorCode.VALIDATION_FAILED, "حجم الملف يتجاوز الحد الأقصى المسموح به (5 ميجابايت)");
        }

        // Validate content type
        String contentType = file.getContentType();
        List<String> allowedMimes = List.of("image/jpeg", "image/png", "image/webp", "application/pdf");
        if (contentType == null || !allowedMimes.contains(contentType.toLowerCase())) {
            throw new BusinessException(ErrorCode.VALIDATION_FAILED, "نوع الملف غير مدعوم. الأنواع المسموحة هي: JPG, PNG, WEBP, PDF");
        }

        // Safe filename generation
        String ext = getFileExtension(file.getOriginalFilename());
        String storageKey = "proof_" + order.getPublicOrderNumber() + "_" + UUID.randomUUID() + ext;
        Path targetPath = this.privateStorageDir.resolve(storageKey);

        try {
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new RuntimeException("فشل حفظ ملف إيصال الدفع بأمان", e);
        }

        Payment payment = paymentRepository.findByOrderId(order.getId())
            .orElseGet(() -> paymentRepository.save(new Payment(order.getId(), PaymentMethod.MANUAL_TRANSFER.name(), order.getTotalAmount())));

        PaymentProof proof = new PaymentProof(
            payment.getId(),
            storageKey,
            file.getOriginalFilename(),
            (int) file.getSize(),
            contentType
        );
        PaymentProof savedProof = paymentProofRepository.save(proof);

        // Update payment state and method
        payment.setStatus("PENDING_VERIFICATION");
        payment.setPaymentMethod(PaymentMethod.MANUAL_TRANSFER.name());
        if (transactionRef != null && !transactionRef.isBlank()) {
            payment.setPaymentReference(transactionRef.trim());
        }
        paymentRepository.save(payment);

        // Update order payment status and method
        order.setPaymentStatus(PaymentStatus.PENDING_VERIFICATION);
        order.setPaymentMethod(PaymentMethod.MANUAL_TRANSFER);
        orderRepository.save(order);

        // Audit history
        String historyNote = "تم إرفاق إيصال سداد إلكتروني (" + file.getOriginalFilename() + ") بانتظار مراجعة وتأكيد الإدارة";
        if (senderPhone != null && !senderPhone.isBlank()) {
            historyNote += " - هاتف المحول: " + senderPhone;
        }
        OrderStatusHistory history = new OrderStatusHistory(
            order,
            order.getOrderStatus().name(),
            order.getOrderStatus().name(),
            null,
            historyNote
        );
        orderStatusHistoryRepository.save(history);

        return PaymentProofResponseDto.fromEntity(savedProof);
    }

    @Transactional(readOnly = true)
    public List<PaymentResponseDto> getPayments(String status) {
        List<Payment> payments;
        if (status != null && !status.isBlank()) {
            payments = paymentRepository.findByStatusOrderByCreatedAtDesc(status.toUpperCase());
        } else {
            payments = paymentRepository.findAllByOrderByCreatedAtDesc();
        }
        return payments.stream().map(PaymentResponseDto::fromEntity).toList();
    }

    @Transactional(readOnly = true)
    public PaymentResponseDto getPaymentById(UUID id) {
        Payment payment = paymentRepository.findById(id)
            .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "سجل الدفع غير موجود"));
        return PaymentResponseDto.fromEntity(payment);
    }

    public PaymentResponseDto approvePayment(UUID paymentId, UUID adminUserId, String note) {
        Payment payment = paymentRepository.findById(paymentId)
            .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "سجل الدفع غير موجود"));

        if ("PAID".equals(payment.getStatus())) {
            throw new BusinessException(ErrorCode.INVALID_STATE_TRANSITION, "تم تأكيد هذا الدفع مسبقاً");
        }

        payment.setStatus("PAID");
        payment.setReviewedByUserId(adminUserId);
        payment.setReviewedAt(Instant.now());
        payment.setReviewNote(note != null ? note : "تم التحقق من الإيصال وتأكيد الدفع بواسطة الإدارة");
        Payment saved = paymentRepository.save(payment);

        // Update associated order
        Order order = orderRepository.findById(payment.getOrderId())
            .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "الطلب المرتبط غير موجود"));

        order.setPaymentStatus(PaymentStatus.PAID);

        // Auto confirm order if it was pending
        if (order.getOrderStatus() == OrderStatus.PENDING) {
            order.setOrderStatus(OrderStatus.CONFIRMED);
            OrderStatusHistory history = new OrderStatusHistory(
                order,
                OrderStatus.PENDING.name(),
                OrderStatus.CONFIRMED.name(),
                adminUserId,
                "تم تأكيد الطلب تلقائياً بعد اعتماد سداد المبلغ كاملاً"
            );
            orderStatusHistoryRepository.save(history);
        }
        orderRepository.save(order);

        return PaymentResponseDto.fromEntity(saved);
    }

    public PaymentResponseDto rejectPayment(UUID paymentId, UUID adminUserId, String note) {
        Payment payment = paymentRepository.findById(paymentId)
            .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "سجل الدفع غير موجود"));

        payment.setStatus("FAILED");
        payment.setReviewedByUserId(adminUserId);
        payment.setReviewedAt(Instant.now());
        payment.setReviewNote(note != null ? note : "تم رفض إيصال الدفع لعدم مطابقته");
        Payment saved = paymentRepository.save(payment);

        Order order = orderRepository.findById(payment.getOrderId()).orElse(null);
        if (order != null) {
            order.setPaymentStatus(PaymentStatus.FAILED);
            orderRepository.save(order);

            OrderStatusHistory history = new OrderStatusHistory(
                order,
                order.getOrderStatus().name(),
                order.getOrderStatus().name(),
                adminUserId,
                "تم رفض إيصال السداد المقدم: " + (note != null ? note : "بيانات التحويل غير مطابقة")
            );
            orderStatusHistoryRepository.save(history);
        }

        return PaymentResponseDto.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public Map.Entry<Resource, String> getProofFile(UUID proofId) {
        PaymentProof proof = paymentProofRepository.findById(proofId)
            .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "إيصال الدفع غير موجود"));

        try {
            Path filePath = this.privateStorageDir.resolve(proof.getStorageKey()).normalize();
            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists() && resource.isReadable()) {
                return Map.entry(resource, proof.getMimeType() != null ? proof.getMimeType() : "application/octet-stream");
            } else {
                throw new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "الملف المخزن غير متاح على الخادم");
            }
        } catch (MalformedURLException e) {
            throw new BusinessException(ErrorCode.INTERNAL_SERVER_ERROR, "مسار الملف غير صالح");
        }
    }

    private String getFileExtension(String filename) {
        if (filename == null || !filename.contains(".")) return ".bin";
        return filename.substring(filename.lastIndexOf("."));
    }
}
