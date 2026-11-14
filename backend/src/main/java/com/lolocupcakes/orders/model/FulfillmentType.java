package com.lolocupcakes.orders.model;

public enum FulfillmentType {
    DELIVERY("توصيل للمنزل"),
    PICKUP("استلام من الفرع");

    private final String labelAr;

    FulfillmentType(String labelAr) {
        this.labelAr = labelAr;
    }

    public String getLabelAr() {
        return labelAr;
    }
}
