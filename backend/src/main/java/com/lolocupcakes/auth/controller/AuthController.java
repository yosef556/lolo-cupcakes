package com.lolocupcakes.auth.controller;

import com.lolocupcakes.auth.dto.*;
import com.lolocupcakes.auth.service.AuthService;
import com.lolocupcakes.common.ApiResponse;
import com.lolocupcakes.common.BusinessException;
import com.lolocupcakes.common.ErrorCode;
import com.lolocupcakes.orders.dto.OrderResponseDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/auth")
@Tag(name = "Authentication & User Profile", description = "إدارة حسابات العملاء وتسجيل الدخول والبروفايل")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    @Operation(summary = "إنشاء حساب عميل جديد")
    public ApiResponse<AuthResponseDto> register(@Valid @RequestBody RegisterRequest request) {
        return ApiResponse.ok(authService.register(request));
    }

    @PostMapping("/login")
    @Operation(summary = "تسجيل الدخول بالبريد أو رقم الهاتف")
    public ApiResponse<AuthResponseDto> login(@Valid @RequestBody LoginRequest request) {
        return ApiResponse.ok(authService.login(request));
    }

    @GetMapping("/me")
    @Operation(summary = "جلب بيانات حساب المستخدم الحالي وسجل طلباته")
    public ApiResponse<UserProfileDto> getProfile(
        @RequestHeader(value = "Authorization", required = false) String authHeader,
        @RequestParam(value = "token", required = false) String tokenParam,
        @RequestParam(value = "userId", required = false) UUID userIdParam
    ) {
        UUID userId = userIdParam;
        if (userId == null) {
            String token = authHeader != null ? authHeader : tokenParam;
            userId = authService.getUserIdFromToken(token);
        }

        if (userId == null) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED_ACCESS, "يرجى تسجيل الدخول للوصول إلى الحساب");
        }

        return ApiResponse.ok(authService.getProfile(userId));
    }

    @PutMapping("/profile")
    @Operation(summary = "تحديث بيانات الملف الشخصي والعنوان")
    public ApiResponse<UserProfileDto> updateProfile(
        @RequestHeader(value = "Authorization", required = false) String authHeader,
        @RequestParam(value = "token", required = false) String tokenParam,
        @RequestParam(value = "userId", required = false) UUID userIdParam,
        @RequestBody UpdateProfileRequest request
    ) {
        UUID userId = userIdParam;
        if (userId == null) {
            String token = authHeader != null ? authHeader : tokenParam;
            userId = authService.getUserIdFromToken(token);
        }

        if (userId == null) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED_ACCESS, "يرجى تسجيل الدخول");
        }

        return ApiResponse.ok(authService.updateProfile(userId, request));
    }

    @GetMapping("/orders")
    @Operation(summary = "جلب طلبات العميل برقم الهاتف أو الجلسة")
    public ApiResponse<List<OrderResponseDto>> getMyOrders(
        @RequestHeader(value = "Authorization", required = false) String authHeader,
        @RequestParam(value = "phone", required = false) String phoneParam
    ) {
        if (phoneParam != null && !phoneParam.isBlank()) {
            return ApiResponse.ok(authService.getOrdersByPhone(phoneParam));
        }

        UUID userId = authService.getUserIdFromToken(authHeader);
        if (userId != null) {
            UserProfileDto profile = authService.getProfile(userId);
            return ApiResponse.ok(profile.getRecentOrders());
        }

        throw new BusinessException(ErrorCode.UNAUTHORIZED_ACCESS, "رقم الهاتف أو تسجيل الدخول مطلوب");
    }

    public record ResetPasswordRequest(String identifier, String newPassword) {}

    @PostMapping("/reset-password")
    @Operation(summary = "إعادة تعيين كلمة المرور بحساب العميل")
    public ApiResponse<String> resetPassword(@RequestBody ResetPasswordRequest req) {
        authService.resetPassword(req.identifier(), req.newPassword());
        return ApiResponse.ok("تمت إعادة تعيين كلمة المرور بنجاح، يمكنك الآن تسجيل الدخول بها");
    }
}
