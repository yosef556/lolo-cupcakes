package com.lolocupcakes.common;

import org.springframework.http.HttpStatus;

public enum ErrorCode {
    VALIDATION_FAILED(HttpStatus.BAD_REQUEST, "بيانات الإدخال غير صالحة"),
    RESOURCE_NOT_FOUND(HttpStatus.NOT_FOUND, "العنصر المطلوب غير موجود"),
    SLOT_CAPACITY_EXCEEDED(HttpStatus.CONFLICT, "عذراً، الفترة الزمنية المطلوبة لم تعد متاحة"),
    INVALID_STATE_TRANSITION(HttpStatus.BAD_REQUEST, "تغيير حالة الطلب غير مسموح به"),
    UNAUTHORIZED_ACCESS(HttpStatus.UNAUTHORIZED, "غير مصرح بالوصول"),
    FORBIDDEN(HttpStatus.FORBIDDEN, "ليس لديك الصلاحية لتنفيذ هذا الإجراء"),
    IDEMPOTENCY_CONFLICT(HttpStatus.CONFLICT, "تم إرسال هذا الطلب مسبقاً وجاري معالجته"),
    QUOTE_EXPIRED(HttpStatus.BAD_REQUEST, "عرض السعر منتهي الصلاحية"),
    PAYMENT_PROOF_INVALID(HttpStatus.BAD_REQUEST, "إثبات الدفع غير صالح أو حجم الملف غير مسموح به"),
    INTERNAL_SERVER_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "حدث خطأ غير متوقع في الخادم");

    private final HttpStatus httpStatus;
    private final String defaultMessageAr;

    ErrorCode(HttpStatus httpStatus, String defaultMessageAr) {
        this.httpStatus = httpStatus;
        this.defaultMessageAr = defaultMessageAr;
    }

    public HttpStatus getHttpStatus() {
        return httpStatus;
    }

    public String getDefaultMessageAr() {
        return defaultMessageAr;
    }
}
