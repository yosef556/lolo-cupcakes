package com.lolocupcakes.cart.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.lolocupcakes.cart.dto.AddToCartRequest;
import com.lolocupcakes.cart.dto.CartDto;
import com.lolocupcakes.cart.dto.CartItemDto;
import com.lolocupcakes.cart.model.Cart;
import com.lolocupcakes.cart.model.CartItem;
import com.lolocupcakes.cart.repository.CartItemRepository;
import com.lolocupcakes.cart.repository.CartRepository;
import com.lolocupcakes.catalog.model.Product;
import com.lolocupcakes.catalog.model.ProductVariant;
import com.lolocupcakes.catalog.repository.ProductRepository;
import com.lolocupcakes.catalog.repository.ProductVariantRepository;
import com.lolocupcakes.common.BusinessException;
import com.lolocupcakes.common.ErrorCode;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;

@Service
@Transactional
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final ProductVariantRepository productVariantRepository;
    private final PricingService pricingService;
    private final ObjectMapper objectMapper;

    public CartService(
        CartRepository cartRepository,
        CartItemRepository cartItemRepository,
        ProductRepository productRepository,
        ProductVariantRepository productVariantRepository,
        PricingService pricingService,
        ObjectMapper objectMapper
    ) {
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.productRepository = productRepository;
        this.productVariantRepository = productVariantRepository;
        this.pricingService = pricingService;
        this.objectMapper = objectMapper;
    }

    public CartDto createCart() {
        Cart cart = new Cart();
        Cart saved = cartRepository.save(cart);
        return CartDto.of(saved.getCartToken(), List.of(), BigDecimal.ZERO);
    }

    @Transactional(readOnly = true)
    public Cart getOrCreateCartEntity(String cartToken) {
        if (cartToken == null || cartToken.trim().isEmpty()) {
            return cartRepository.save(new Cart());
        }
        return cartRepository.findByCartToken(cartToken)
            .orElseGet(() -> cartRepository.save(new Cart(cartToken)));
    }

    @Transactional(readOnly = true)
    public CartDto getCart(String cartToken) {
        Cart cart = getOrCreateCartEntity(cartToken);
        List<CartItemDto> itemDtos = cart.getItems().stream()
            .map(pricingService::calculateItemPrice)
            .toList();

        BigDecimal subtotal = itemDtos.stream()
            .map(CartItemDto::lineTotal)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        return CartDto.of(cart.getCartToken(), itemDtos, subtotal);
    }

    public CartDto addItem(String cartToken, AddToCartRequest request) {
        Cart cart = getOrCreateCartEntity(cartToken);

        Product product = productRepository.findById(request.productId())
            .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "المنتج غير موجود"));

        if (!Boolean.TRUE.equals(product.getIsActive())) {
            throw new BusinessException(ErrorCode.VALIDATION_FAILED, "هذا المنتج غير متاح للشراء حالياً");
        }

        ProductVariant variant = null;
        if (request.variantId() != null) {
            variant = productVariantRepository.findById(request.variantId())
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "المتغير/الحجم المحدد غير موجود"));
            if (!variant.getProductId().equals(product.getId())) {
                throw new BusinessException(ErrorCode.VALIDATION_FAILED, "المتغير لا ينتمي للمنتج المحدد");
            }
        }

        Map<String, Object> configMap = new HashMap<>();
        if (request.selectedOptionValueIds() != null) {
            configMap.put("optionValueIds", request.selectedOptionValueIds());
        }
        if (request.selectedAddonIds() != null) {
            configMap.put("addonIds", request.selectedAddonIds());
        }
        if (request.customerNote() != null) {
            configMap.put("note", request.customerNote());
        }

        String configJson = "{}";
        try {
            configJson = objectMapper.writeValueAsString(configMap);
        } catch (Exception ignored) {
        }

        CartItem item = new CartItem(cart, product, variant, request.quantity(), configJson);
        cart.getItems().add(item);
        cartRepository.save(cart);

        return getCart(cart.getCartToken());
    }

    public CartDto updateItemQuantity(String cartToken, UUID itemId, int quantity) {
        Cart cart = getOrCreateCartEntity(cartToken);

        CartItem item = cart.getItems().stream()
            .filter(i -> i.getId().equals(itemId))
            .findFirst()
            .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "العنصر غير موجود في السلة"));

        if (quantity <= 0) {
            cart.getItems().remove(item);
            cartItemRepository.delete(item);
        } else {
            item.setQuantity(quantity);
            cartItemRepository.save(item);
        }

        return getCart(cart.getCartToken());
    }

    public CartDto removeItem(String cartToken, UUID itemId) {
        Cart cart = getOrCreateCartEntity(cartToken);

        CartItem item = cart.getItems().stream()
            .filter(i -> i.getId().equals(itemId))
            .findFirst()
            .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "العنصر غير موجود في السلة"));

        cart.getItems().remove(item);
        cartItemRepository.delete(item);

        return getCart(cart.getCartToken());
    }

    public void clearCart(Cart cart) {
        cart.getItems().clear();
        cartRepository.save(cart);
    }
}
