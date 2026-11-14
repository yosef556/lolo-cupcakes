package com.lolocupcakes.orders.model;

public enum PaymentMethod {
    CASH("الدفع نقداً"),
    MANUAL_TRANSFER("تحويل بنكي / إنستاباي"),
    CARD_ONLINE("بطاقة بنكية / فيزا وماستركارد فوري");

    private final String labelAr;

    PaymentMethod(String labelAr) {
        this.labelAr = labelAr;
    }

    public String getLabelAr() {
        return labelAr;
    }
}
