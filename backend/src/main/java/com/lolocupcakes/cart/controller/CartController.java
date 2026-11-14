package com.lolocupcakes.cart.controller;

import com.lolocupcakes.cart.dto.AddToCartRequest;
import com.lolocupcakes.cart.dto.CartDto;
import com.lolocupcakes.cart.dto.UpdateCartItemRequest;
import com.lolocupcakes.cart.service.CartService;
import com.lolocupcakes.common.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/carts")
@Tag(name = "Cart", description = "واجهات إدارة سلة التسوق للزائر والعميل")
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    @PostMapping
    @Operation(summary = "إنشاء سلة تسوق جديدة وتوليد رمز السلة")
    public ApiResponse<CartDto> createCart() {
        return ApiResponse.ok("تم إنشاء السلة بنجاح", cartService.createCart());
    }

    @GetMapping("/{cartToken}")
    @Operation(summary = "استعراض عناصر السلة والحسابات الإرشادية")
    public ApiResponse<CartDto> getCart(@PathVariable String cartToken) {
        return ApiResponse.ok(cartService.getCart(cartToken));
    }

    @PostMapping("/{cartToken}/items")
    @Operation(summary = "إضافة منتج مع الخيارات والإضافات إلى السلة")
    public ApiResponse<CartDto> addItem(
        @PathVariable String cartToken,
        @Valid @RequestBody AddToCartRequest request
    ) {
        return ApiResponse.ok("تمت إضافة المنتج إلى السلة بنجاح", cartService.addItem(cartToken, request));
    }

    @PatchMapping("/{cartToken}/items/{itemId}")
    @Operation(summary = "تعديل كمية عنصر في السلة")
    public ApiResponse<CartDto> updateQuantity(
        @PathVariable String cartToken,
        @PathVariable UUID itemId,
        @Valid @RequestBody UpdateCartItemRequest request
    ) {
        return ApiResponse.ok("تم تحديث الكمية بنجاح", cartService.updateItemQuantity(cartToken, itemId, request.quantity()));
    }

    @DeleteMapping("/{cartToken}/items/{itemId}")
    @Operation(summary = "حذف عنصر من السلة")
    public ApiResponse<CartDto> removeItem(
        @PathVariable String cartToken,
        @PathVariable UUID itemId
    ) {
        return ApiResponse.ok("تم حذف العنصر من السلة بنجاح", cartService.removeItem(cartToken, itemId));
    }
}
