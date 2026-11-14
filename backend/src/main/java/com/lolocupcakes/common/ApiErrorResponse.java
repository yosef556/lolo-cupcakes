package com.lolocupcakes.common;

import java.time.Instant;
import java.util.List;

public record ApiErrorResponse(
    String code,
    String message,
    List<FieldErrorItem> fieldErrors,
    String traceId,
    Instant timestamp
) {
    public record FieldErrorItem(String field, String message) {}

    public static ApiErrorResponse of(String code, String message, String traceId) {
        return new ApiErrorResponse(code, message, List.of(), traceId, Instant.now());
    }

    public static ApiErrorResponse of(String code, String message, List<FieldErrorItem> fieldErrors, String traceId) {
        return new ApiErrorResponse(code, message, fieldErrors, traceId, Instant.now());
    }
}
