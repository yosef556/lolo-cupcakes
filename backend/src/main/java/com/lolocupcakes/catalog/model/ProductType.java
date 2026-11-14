package com.lolocupcakes.catalog.model;

public enum ProductType {
    CUPCAKE("كب كيك"),
    CAKE("كيك وتورتات"),
    GATEAU("جاتوه"),
    ORIENTAL("حلويات شرقية"),
    WESTERN("حلويات غربية"),
    BOX("بوكسات مشكلة"),
    CUSTOM("كيك مخصص");

    private final String labelAr;

    ProductType(String labelAr) {
        this.labelAr = labelAr;
    }

    public String getLabelAr() {
        return labelAr;
    }
}
