package com.lolocupcakes.cart.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.lolocupcakes.cart.dto.CartItemDto;
import com.lolocupcakes.cart.dto.CheckoutQuoteRequest;
import com.lolocupcakes.cart.dto.CheckoutQuoteResponse;
import com.lolocupcakes.cart.model.Cart;
import com.lolocupcakes.cart.model.CartItem;
import com.lolocupcakes.catalog.model.OptionValue;
import com.lolocupcakes.catalog.model.Product;
import com.lolocupcakes.catalog.model.ProductAddon;
import com.lolocupcakes.catalog.model.ProductVariant;
import com.lolocupcakes.catalog.repository.OptionValueRepository;
import com.lolocupcakes.catalog.repository.ProductAddonRepository;
import com.lolocupcakes.common.BusinessException;
import com.lolocupcakes.common.ErrorCode;
import com.lolocupcakes.fulfillment.model.DeliveryZone;
import com.lolocupcakes.fulfillment.repository.DeliveryZoneRepository;
import com.lolocupcakes.promotions.model.Coupon;
import com.lolocupcakes.promotions.repository.CouponRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.*;

@Service
public class PricingService {

    private final OptionValueRepository optionValueRepository;
    private final ProductAddonRepository productAddonRepository;
    private final DeliveryZoneRepository deliveryZoneRepository;
    private final CouponRepository couponRepository;
    private final ObjectMapper objectMapper;

    public PricingService(
        OptionValueRepository optionValueRepository,
        ProductAddonRepository productAddonRepository,
        DeliveryZoneRepository deliveryZoneRepository,
        CouponRepository couponRepository,
        ObjectMapper objectMapper
    ) {
        this.optionValueRepository = optionValueRepository;
        this.productAddonRepository = productAddonRepository;
        this.deliveryZoneRepository = deliveryZoneRepository;
        this.couponRepository = couponRepository;
        this.objectMapper = objectMapper;
    }

    public CartItemDto calculateItemPrice(CartItem item) {
        Product product = item.getProduct();
        ProductVariant variant = item.getVariant();

        BigDecimal unitPrice = product.getBasePrice();
        if (variant != null && variant.getPriceOverride() != null) {
            unitPrice = variant.getPriceOverride();
        }

        List<String> optionDescriptions = new ArrayList<>();
        List<String> addonDescriptions = new ArrayList<>();

        try {
            Map<String, Object> config = objectMapper.readValue(
                item.getSelectedConfiguration(),
                new TypeReference<>() {}
            );

            // Options
            if (config.get("optionValueIds") instanceof List<?> valIds) {
                for (Object idObj : valIds) {
                    if (idObj != null) {
                        UUID valId = UUID.fromString(idObj.toString());
                        Optional<OptionValue> optVal = optionValueRepository.findById(valId);
                        if (optVal.isPresent()) {
                            OptionValue ov = optVal.get();
                            unitPrice = unitPrice.add(ov.getPriceModifier());
                            optionDescriptions.add(ov.getNameAr() + (ov.getPriceModifier().compareTo(BigDecimal.ZERO) > 0 ? " (+" + ov.getPriceModifier() + " ج.م)" : ""));
                        }
                    }
                }
            }

            // Addons
            if (config.get("addonIds") instanceof List<?> addIds) {
                for (Object idObj : addIds) {
                    if (idObj != null) {
                        UUID addId = UUID.fromString(idObj.toString());
                        Optional<ProductAddon> addonOpt = productAddonRepository.findById(addId);
                        if (addonOpt.isPresent()) {
                            ProductAddon addon = addonOpt.get();
                            unitPrice = unitPrice.add(addon.getPrice());
                            addonDescriptions.add(addon.getNameAr() + " (+" + addon.getPrice() + " ج.م)");
                        }
                    }
                }
            }
        } catch (Exception ignored) {
        }

        BigDecimal lineTotal = unitPrice.multiply(BigDecimal.valueOf(item.getQuantity()));

        return new CartItemDto(
            item.getId(),
            product.getId(),
            product.getNameAr(),
            product.getSlug(),
            variant != null ? variant.getId() : null,
            variant != null ? variant.getNameAr() : null,
            unitPrice,
            item.getQuantity(),
            lineTotal,
            item.getSelectedConfiguration(),
            optionDescriptions,
            addonDescriptions
        );
    }

    public CheckoutQuoteResponse calculateAuthoritativeQuote(Cart cart, CheckoutQuoteRequest request) {
        List<CartItemDto> calculatedItems = cart.getItems().stream()
            .map(this::calculateItemPrice)
            .toList();

        BigDecimal subtotal = calculatedItems.stream()
            .map(CartItemDto::lineTotal)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<String> warnings = new ArrayList<>();
        BigDecimal deliveryFee = BigDecimal.ZERO;
        String zoneName = null;

        if ("DELIVERY".equalsIgnoreCase(request.fulfillmentType())) {
            if (request.deliveryZoneId() == null) {
                throw new BusinessException(ErrorCode.VALIDATION_FAILED, "يجب تحديد منطقة التوصيل");
            }
            DeliveryZone zone = deliveryZoneRepository.findById(request.deliveryZoneId())
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "منطقة التوصيل المحددة غير موجودة"));
            
            if (!Boolean.TRUE.equals(zone.getIsActive())) {
                throw new BusinessException(ErrorCode.VALIDATION_FAILED, "التوصيل لهذه المنطقة متوقف مؤقتاً");
            }

            if (subtotal.compareTo(zone.getMinOrderAmount()) < 0) {
                throw new BusinessException(
                    ErrorCode.VALIDATION_FAILED,
                    "الحد الأدنى للطلب لمنطقة " + zone.getNameAr() + " هو " + zone.getMinOrderAmount() + " ج.م"
                );
            }

            deliveryFee = zone.getDeliveryFee();
            zoneName = zone.getNameAr();
        } else if ("PICKUP".equalsIgnoreCase(request.fulfillmentType())) {
            deliveryFee = BigDecimal.ZERO;
            zoneName = "استلام من الفرع الرئيسي (بدون رسوم)";
        } else {
            throw new BusinessException(ErrorCode.VALIDATION_FAILED, "نوع الاستلام والتوصيل غير صالح");
        }

        // Coupon calculation
        BigDecimal discount = BigDecimal.ZERO;
        if (request.couponCode() != null && !request.couponCode().trim().isEmpty()) {
            Optional<Coupon> couponOpt = couponRepository.findByCodeIgnoreCaseAndIsActiveTrue(request.couponCode().trim());
            if (couponOpt.isPresent()) {
                Coupon coupon = couponOpt.get();
                if (coupon.isValid(subtotal)) {
                    discount = coupon.calculateDiscount(subtotal);
                } else {
                    warnings.add("كود الخصم غير صالح أو لم يستوفِ الحد الأدنى لقيمة الطلب");
                }
            } else {
                warnings.add("كود الخصم غير موجود أو منتهي الصلاحية");
            }
        }

        BigDecimal total = subtotal.subtract(discount).add(deliveryFee).max(BigDecimal.ZERO);

        return new CheckoutQuoteResponse(
            true,
            request.fulfillmentType().toUpperCase(),
            zoneName,
            subtotal,
            discount,
            deliveryFee,
            total,
            "EGP",
            calculatedItems,
            warnings
        );
    }
}
