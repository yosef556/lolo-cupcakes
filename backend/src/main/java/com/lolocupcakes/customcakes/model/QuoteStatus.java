package com.lolocupcakes.customcakes.model;

public enum QuoteStatus {
    PENDING("قيد انتظار رد العميل"),
    ACCEPTED("مقبول"),
    DECLINED("مرفوض"),
    EXPIRED("منتهي الصلاحية");

    private final String labelAr;

    QuoteStatus(String labelAr) {
        this.labelAr = labelAr;
    }

    public String getLabelAr() {
        return labelAr;
    }
}
