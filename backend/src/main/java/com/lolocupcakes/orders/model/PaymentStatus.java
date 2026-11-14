package com.lolocupcakes.orders.model;

public enum PaymentStatus {
    UNPAID("غير مدفوع"),
    PENDING_VERIFICATION("قيد مراجعة التحويل"),
    PAID("تم السداد بنجاح"),
    FAILED("فشل السداد"),
    REJECTED("إيصال مرفوض"),
    REFUNDED("مسترد");

    private final String labelAr;

    PaymentStatus(String labelAr) {
        this.labelAr = labelAr;
    }

    public String getLabelAr() {
        return labelAr;
    }
}
