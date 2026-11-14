package com.lolocupcakes.common;

import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.NoHandlerFoundException;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ApiErrorResponse> handleBusinessException(BusinessException ex, HttpServletRequest request) {
        String traceId = UUID.randomUUID().toString();
        log.warn("Business rule violation [traceId={}]: {} - {}", traceId, ex.getErrorCode().name(), ex.getMessage());
        
        ApiErrorResponse response = ApiErrorResponse.of(
            ex.getErrorCode().name(),
            ex.getMessage(),
            traceId
        );
        return ResponseEntity.status(ex.getErrorCode().getHttpStatus()).body(response);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiErrorResponse> handleValidationException(MethodArgumentNotValidException ex, HttpServletRequest request) {
        String traceId = UUID.randomUUID().toString();
        List<ApiErrorResponse.FieldErrorItem> fieldErrors = new ArrayList<>();
        for (FieldError fieldError : ex.getBindingResult().getFieldErrors()) {
            fieldErrors.add(new ApiErrorResponse.FieldErrorItem(fieldError.getField(), fieldError.getDefaultMessage()));
        }

        log.warn("Validation error [traceId={}]: {} errors", traceId, fieldErrors.size());
        ApiErrorResponse response = ApiErrorResponse.of(
            ErrorCode.VALIDATION_FAILED.name(),
            ErrorCode.VALIDATION_FAILED.getDefaultMessageAr(),
            fieldErrors,
            traceId
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    @ExceptionHandler(NoHandlerFoundException.class)
    public ResponseEntity<ApiErrorResponse> handleNotFound(NoHandlerFoundException ex) {
        String traceId = UUID.randomUUID().toString();
        ApiErrorResponse response = ApiErrorResponse.of(
            ErrorCode.RESOURCE_NOT_FOUND.name(),
            "المسار المطلوب غير موجود: " + ex.getRequestURL(),
            traceId
        );
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiErrorResponse> handleGeneralException(Exception ex, HttpServletRequest request) {
        String traceId = UUID.randomUUID().toString();
        log.error("Unhandled exception [traceId={}]: ", traceId, ex);

        ApiErrorResponse response = ApiErrorResponse.of(
            ErrorCode.INTERNAL_SERVER_ERROR.name(),
            ErrorCode.INTERNAL_SERVER_ERROR.getDefaultMessageAr(),
            traceId
        );
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }
}
