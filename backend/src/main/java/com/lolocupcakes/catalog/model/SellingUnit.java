package com.lolocupcakes.catalog.model;

public enum SellingUnit {
    PIECE("بالقطعة"),
    BOX("بالعلبة"),
    WEIGHT("بالوزن / كجم"),
    CONFIGURABLE("حسب التخصيص");

    private final String labelAr;

    SellingUnit(String labelAr) {
        this.labelAr = labelAr;
    }

    public String getLabelAr() {
        return labelAr;
    }
}
