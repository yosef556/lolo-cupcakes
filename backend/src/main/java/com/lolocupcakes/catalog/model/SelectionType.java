package com.lolocupcakes.catalog.model;

public enum SelectionType {
    SINGLE("اختيار واحد"),
    MULTIPLE("متعدد الاختيارات");

    private final String labelAr;

    SelectionType(String labelAr) {
        this.labelAr = labelAr;
    }

    public String getLabelAr() {
        return labelAr;
    }
}
