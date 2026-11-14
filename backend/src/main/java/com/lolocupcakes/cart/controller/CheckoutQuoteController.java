package com.lolocupcakes.cart.controller;

import com.lolocupcakes.cart.dto.CheckoutQuoteRequest;
import com.lolocupcakes.cart.dto.CheckoutQuoteResponse;
import com.lolocupcakes.cart.model.Cart;
import com.lolocupcakes.cart.service.CartService;
import com.lolocupcakes.cart.service.PricingService;
import com.lolocupcakes.common.ApiResponse;
import com.lolocupcakes.common.BusinessException;
import com.lolocupcakes.common.ErrorCode;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/checkout")
@Tag(name = "Checkout Quote", description = "نقطة التسعير السيادي وحساب إجمالي الشراء الرسمي والخصومات والتوصيل")
public class CheckoutQuoteController {

    private final CartService cartService;
    private final PricingService pricingService;

    public CheckoutQuoteController(CartService cartService, PricingService pricingService) {
        this.cartService = cartService;
        this.pricingService = pricingService;
    }

    @PostMapping("/quote")
    @Operation(summary = "حساب الإجمالي السيادي والخصم ورسوم التوصيل المؤكدة من السيرفر")
    public ApiResponse<CheckoutQuoteResponse> calculateQuote(@Valid @RequestBody CheckoutQuoteRequest request) {
        Cart cart = cartService.getOrCreateCartEntity(request.cartToken());
        if (cart.getItems().isEmpty()) {
            throw new BusinessException(ErrorCode.VALIDATION_FAILED, "سلة التسوق فارغة، لا يمكن طلب عرض تسعير");
        }

        CheckoutQuoteResponse quote = pricingService.calculateAuthoritativeQuote(cart, request);
        return ApiResponse.ok("تم حساب التسعير الرسمي بنجاح", quote);
    }
}
