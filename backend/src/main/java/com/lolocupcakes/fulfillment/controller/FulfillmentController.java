package com.lolocupcakes.fulfillment.controller;

import com.lolocupcakes.common.ApiResponse;
import com.lolocupcakes.fulfillment.model.DeliveryZone;
import com.lolocupcakes.fulfillment.repository.DeliveryZoneRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
@Tag(name = "Fulfillment", description = "واجهات مناطق التوصيل المعتمدة وتفاصيل الاستلام")
public class FulfillmentController {

    private final DeliveryZoneRepository deliveryZoneRepository;

    public FulfillmentController(DeliveryZoneRepository deliveryZoneRepository) {
        this.deliveryZoneRepository = deliveryZoneRepository;
    }

    @GetMapping("/delivery-zones")
    @Operation(summary = "قائمة مناطق التوصيل النشطة ورسوم التوصيل والحد الأدنى للطلب")
    public ApiResponse<List<DeliveryZone>> getDeliveryZones() {
        return ApiResponse.ok(deliveryZoneRepository.findByIsActiveTrueOrderByDisplayOrderAsc());
    }

    @GetMapping("/admin/delivery-zones")
    @Operation(summary = "عرض جميع مناطق التوصيل للإدارة")
    public ApiResponse<List<DeliveryZone>> getAdminDeliveryZones() {
        return ApiResponse.ok(deliveryZoneRepository.findAllByOrderByDisplayOrderAsc());
    }

    @PostMapping("/admin/delivery-zones")
    @Operation(summary = "إضافة منطقة توصيل جديدة")
    public ApiResponse<DeliveryZone> createDeliveryZone(@RequestBody DeliveryZone zone) {
        if (zone.getDisplayOrder() == null) {
            zone.setDisplayOrder(0);
        }
        if (zone.getIsActive() == null) {
            zone.setIsActive(true);
        }
        DeliveryZone saved = deliveryZoneRepository.save(zone);
        return ApiResponse.ok("تمت إضافة منطقة التوصيل بنجاح", saved);
    }

    @PutMapping("/admin/delivery-zones/{id}")
    @Operation(summary = "تحديث بيانات منطقة توصيل")
    public ApiResponse<DeliveryZone> updateDeliveryZone(@PathVariable java.util.UUID id, @RequestBody DeliveryZone request) {
        DeliveryZone zone = deliveryZoneRepository.findById(id)
            .orElseThrow(() -> new com.lolocupcakes.common.BusinessException(com.lolocupcakes.common.ErrorCode.RESOURCE_NOT_FOUND, "منطقة التوصيل غير موجودة"));
        if (request.getNameAr() != null) zone.setNameAr(request.getNameAr());
        if (request.getNameEn() != null) zone.setNameEn(request.getNameEn());
        if (request.getDeliveryFee() != null) zone.setDeliveryFee(request.getDeliveryFee());
        if (request.getMinOrderAmount() != null) zone.setMinOrderAmount(request.getMinOrderAmount());
        if (request.getIsActive() != null) zone.setIsActive(request.getIsActive());
        if (request.getDisplayOrder() != null) zone.setDisplayOrder(request.getDisplayOrder());
        DeliveryZone updated = deliveryZoneRepository.save(zone);
        return ApiResponse.ok("تم تحديث منطقة التوصيل بنجاح", updated);
    }

    @DeleteMapping("/admin/delivery-zones/{id}")
    @Operation(summary = "حذف أو تعطيل منطقة توصيل")
    public ApiResponse<Void> deleteDeliveryZone(@PathVariable java.util.UUID id) {
        DeliveryZone zone = deliveryZoneRepository.findById(id)
            .orElseThrow(() -> new com.lolocupcakes.common.BusinessException(com.lolocupcakes.common.ErrorCode.RESOURCE_NOT_FOUND, "منطقة التوصيل غير موجودة"));
        zone.setIsActive(false);
        deliveryZoneRepository.save(zone);
        return ApiResponse.ok("تم تعطيل منطقة التوصيل بنجاح", null);
    }
}
