package com.lolocupcakes.customcakes.model;

public enum CustomCakeStatus {
    SUBMITTED("تم استلام الطلب وبانتظار التسعير"),
    QUOTED("تم إرسال عرض السعر للعميل"),
    ACCEPTED("تم قبول عرض السعر من العميل"),
    DECLINED("تم رفض عرض السعر"),
    EXPIRED("انتهت صلاحية عرض السعر"),
    CANCELLED("ملغي");

    private final String labelAr;

    CustomCakeStatus(String labelAr) {
        this.labelAr = labelAr;
    }

    public String getLabelAr() {
        return labelAr;
    }
}
