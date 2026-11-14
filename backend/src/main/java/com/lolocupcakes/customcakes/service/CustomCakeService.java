package com.lolocupcakes.customcakes.service;

import com.lolocupcakes.common.BusinessException;
import com.lolocupcakes.common.ErrorCode;
import com.lolocupcakes.customcakes.dto.*;
import com.lolocupcakes.customcakes.model.CustomCakeQuote;
import com.lolocupcakes.customcakes.model.CustomCakeRequest;
import com.lolocupcakes.customcakes.model.CustomCakeStatus;
import com.lolocupcakes.customcakes.model.QuoteStatus;
import com.lolocupcakes.customcakes.repository.CustomCakeQuoteRepository;
import com.lolocupcakes.customcakes.repository.CustomCakeRequestRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.security.SecureRandom;
import java.time.Instant;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@Transactional
public class CustomCakeService {

    private static final UUID DEFAULT_ADMIN_ID = UUID.fromString("a0000000-0000-0000-0000-000000000001");

    private final CustomCakeRequestRepository requestRepository;
    private final CustomCakeQuoteRepository quoteRepository;
    private final Path privateStorageDir;
    private final SecureRandom random = new SecureRandom();

    public CustomCakeService(
        CustomCakeRequestRepository requestRepository,
        CustomCakeQuoteRepository quoteRepository,
        @Value("${app.upload.custom-cakes-dir:uploads/private/custom_cakes}") String uploadDir
    ) {
        this.requestRepository = requestRepository;
        this.quoteRepository = quoteRepository;
        this.privateStorageDir = Paths.get(uploadDir).toAbsolutePath().normalize();

        try {
            Files.createDirectories(this.privateStorageDir);
        } catch (IOException e) {
            throw new RuntimeException("تعذر إنشاء مجلد صور التورتات الخاصة", e);
        }
    }

    public CustomCakeRequestResponseDto createRequest(CreateCustomCakeRequestDto dto, MultipartFile referenceImage) {
        String reference = generatePublicReference();
        String accessToken = UUID.randomUUID().toString().replace("-", "");

        String imageKey = null;
        if (referenceImage != null && !referenceImage.isEmpty()) {
            if (referenceImage.getSize() > 5 * 1024 * 1024) {
                throw new BusinessException(ErrorCode.VALIDATION_FAILED, "حجم الصورة المرجعية يتجاوز 5 ميجابايت");
            }
            String contentType = referenceImage.getContentType();
            List<String> allowed = List.of("image/jpeg", "image/png", "image/webp");
            if (contentType == null || !allowed.contains(contentType.toLowerCase())) {
                throw new BusinessException(ErrorCode.VALIDATION_FAILED, "صيغة الصورة غير مدعومة. يرجى رفع صورة JPG أو PNG أو WEBP");
            }

            String ext = getFileExtension(referenceImage.getOriginalFilename());
            imageKey = "cake_ref_" + reference + "_" + UUID.randomUUID() + ext;
            Path targetPath = this.privateStorageDir.resolve(imageKey);
            try {
                Files.copy(referenceImage.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);
            } catch (IOException e) {
                throw new RuntimeException("فشل حفظ الصورة المرجعية للتورتة", e);
            }
        }

        CustomCakeRequest req = new CustomCakeRequest();
        req.setPublicReference(reference);
        req.setAccessToken(accessToken);
        req.setCustomerName(dto.customerName());
        req.setCustomerPhone(dto.customerPhone());
        req.setCustomerEmail(dto.customerEmail());
        req.setRequestedDate(dto.requestedDate());
        req.setServingsNeeded(dto.servingsNeeded());
        req.setFlavorPreference(dto.flavorPreference());
        req.setMessageOnCake(dto.messageOnCake());
        req.setNotes(dto.notes());
        req.setReferenceImageStorageKey(imageKey);
        req.setStatus(CustomCakeStatus.SUBMITTED);

        CustomCakeRequest saved = requestRepository.save(req);
        return CustomCakeRequestResponseDto.fromEntity(saved, true);
    }

    @Transactional(readOnly = true)
    public CustomCakeRequestResponseDto getRequest(String publicReference, String token) {
        CustomCakeRequest req = requestRepository.findByPublicReference(publicReference)
            .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "طلب التورتة الخاصة غير موجود"));

        if (!req.getAccessToken().equals(token)) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED_ACCESS, "رمز التحقق من الطلب غير صحيح");
        }

        return CustomCakeRequestResponseDto.fromEntity(req, true);
    }

    public CustomCakeRequestResponseDto acceptQuote(String publicReference, String token, UUID quoteId) {
        CustomCakeRequest req = requestRepository.findByPublicReference(publicReference)
            .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "طلب التورتة الخاصة غير موجود"));

        if (!req.getAccessToken().equals(token)) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED_ACCESS, "رمز التحقق من الطلب غير صحيح");
        }

        CustomCakeQuote quote = quoteRepository.findById(quoteId)
            .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "عرض السعر غير موجود"));

        if (!quote.getRequest().getId().equals(req.getId())) {
            throw new BusinessException(ErrorCode.VALIDATION_FAILED, "عرض السعر لا يتبع هذا الطلب");
        }

        if (Instant.now().isAfter(quote.getExpiresAt())) {
            quote.setStatus(QuoteStatus.EXPIRED);
            quoteRepository.save(quote);
            req.setStatus(CustomCakeStatus.EXPIRED);
            requestRepository.save(req);
            throw new BusinessException(ErrorCode.QUOTE_EXPIRED, "عذراً، انتهت صلاحية عرض السعر هذا. يرجى طلب تسعير محدث.");
        }

        if (quote.getStatus() != QuoteStatus.PENDING) {
            throw new BusinessException(ErrorCode.INVALID_STATE_TRANSITION, "تم الرد على عرض السعر هذا مسبقاً");
        }

        quote.setStatus(QuoteStatus.ACCEPTED);
        quote.setRespondedAt(Instant.now());
        quoteRepository.save(quote);

        req.setStatus(CustomCakeStatus.ACCEPTED);
        CustomCakeRequest updated = requestRepository.save(req);

        return CustomCakeRequestResponseDto.fromEntity(updated, true);
    }

    public CustomCakeRequestResponseDto declineQuote(String publicReference, String token, UUID quoteId) {
        CustomCakeRequest req = requestRepository.findByPublicReference(publicReference)
            .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "طلب التورتة الخاصة غير موجود"));

        if (!req.getAccessToken().equals(token)) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED_ACCESS, "رمز التحقق من الطلب غير صحيح");
        }

        CustomCakeQuote quote = quoteRepository.findById(quoteId)
            .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "عرض السعر غير موجود"));

        if (!quote.getRequest().getId().equals(req.getId())) {
            throw new BusinessException(ErrorCode.VALIDATION_FAILED, "عرض السعر لا يتبع هذا الطلب");
        }

        quote.setStatus(QuoteStatus.DECLINED);
        quote.setRespondedAt(Instant.now());
        quoteRepository.save(quote);

        req.setStatus(CustomCakeStatus.DECLINED);
        CustomCakeRequest updated = requestRepository.save(req);

        return CustomCakeRequestResponseDto.fromEntity(updated, true);
    }

    @Transactional(readOnly = true)
    public Page<CustomCakeRequestResponseDto> adminGetRequests(CustomCakeStatus status, Pageable pageable) {
        Page<CustomCakeRequest> page;
        if (status != null) {
            page = requestRepository.findByStatusOrderByCreatedAtDesc(status, pageable);
        } else {
            page = requestRepository.findAllByOrderByCreatedAtDesc(pageable);
        }
        return page.map(r -> CustomCakeRequestResponseDto.fromEntity(r, false));
    }

    @Transactional(readOnly = true)
    public CustomCakeRequestResponseDto adminGetRequestById(UUID id) {
        CustomCakeRequest req = requestRepository.findById(id)
            .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "طلب التورتة غير موجود"));
        return CustomCakeRequestResponseDto.fromEntity(req, true);
    }

    public CustomCakeRequestResponseDto adminSubmitQuote(UUID requestId, SubmitQuoteRequestDto dto, UUID adminUserId) {
        CustomCakeRequest req = requestRepository.findById(requestId)
            .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "طلب التورتة غير موجود"));

        UUID actorId = adminUserId != null ? adminUserId : DEFAULT_ADMIN_ID;
        int hours = (dto.expiresInHours() != null && dto.expiresInHours() > 0) ? dto.expiresInHours() : 48;
        Instant expiresAt = Instant.now().plus(hours, ChronoUnit.HOURS);

        CustomCakeQuote quote = new CustomCakeQuote(
            req,
            dto.quotedPrice(),
            dto.termsAndDetails(),
            expiresAt,
            actorId
        );
        CustomCakeQuote savedQuote = quoteRepository.save(quote);
        req.getQuotes().add(savedQuote);

        req.setStatus(CustomCakeStatus.QUOTED);
        CustomCakeRequest saved = requestRepository.save(req);

        return CustomCakeRequestResponseDto.fromEntity(saved, true);
    }

    @Transactional(readOnly = true)
    public Map.Entry<Resource, String> getReferenceImageFile(UUID requestId) {
        CustomCakeRequest req = requestRepository.findById(requestId)
            .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "طلب التورتة غير موجود"));

        if (req.getReferenceImageStorageKey() == null) {
            throw new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "لا توجد صورة مرجعية مرفقة بهذا الطلب");
        }

        try {
            Path filePath = this.privateStorageDir.resolve(req.getReferenceImageStorageKey()).normalize();
            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists() && resource.isReadable()) {
                String mime = req.getReferenceImageStorageKey().endsWith(".png") ? "image/png" : "image/jpeg";
                return Map.entry(resource, mime);
            } else {
                throw new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "الصورة المرجعية غير متاحة على الخادم");
            }
        } catch (MalformedURLException e) {
            throw new BusinessException(ErrorCode.INTERNAL_SERVER_ERROR, "مسار الصورة غير صالح");
        }
    }

    private String generatePublicReference() {
        String datePart = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        int rand = 1000 + random.nextInt(9000);
        return "CCR-" + datePart + "-" + rand;
    }

    private String getFileExtension(String filename) {
        if (filename == null || !filename.contains(".")) return ".jpg";
        return filename.substring(filename.lastIndexOf("."));
    }
}
