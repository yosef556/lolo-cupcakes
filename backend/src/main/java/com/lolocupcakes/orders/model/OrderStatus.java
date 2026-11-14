package com.lolocupcakes.orders.model;

public enum OrderStatus {
    PENDING("قيد المراجعة والتأكيد"),
    CONFIRMED("تم تأكيد الطلب"),
    PREPARING("جاري التجهيز والخبز"),
    READY("جاهز للاستلام / التسليم"),
    OUT_FOR_DELIVERY("خرج مع مندوب التوصيل"),
    COMPLETED("تم التسليم بنجاح"),
    CANCELLED("ملغي"),
    REJECTED("مرفوض");

    private final String labelAr;

    OrderStatus(String labelAr) {
        this.labelAr = labelAr;
    }

    public String getLabelAr() {
        return labelAr;
    }

    public boolean canTransitionTo(OrderStatus target, boolean isPickup) {
        if (this == target) return true;
        if (this == COMPLETED || this == CANCELLED || this == REJECTED) return false;

        return switch (this) {
            case PENDING -> target == CONFIRMED || target == CANCELLED || target == REJECTED;
            case CONFIRMED -> target == PREPARING || target == CANCELLED || target == REJECTED;
            case PREPARING -> target == READY || target == CANCELLED;
            case READY -> isPickup ? (target == COMPLETED || target == CANCELLED) : (target == OUT_FOR_DELIVERY || target == CANCELLED);
            case OUT_FOR_DELIVERY -> target == COMPLETED || target == CANCELLED;
            default -> false;
        };
    }
}
