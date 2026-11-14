package com.lolocupcakes.orders.controller;

import com.lolocupcakes.common.ApiResponse;
import com.lolocupcakes.orders.dto.OrderResponseDto;
import com.lolocupcakes.orders.dto.UpdateOrderStatusRequest;
import com.lolocupcakes.orders.model.OrderStatus;
import com.lolocupcakes.orders.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/orders")
@Tag(name = "Admin Orders", description = "إدارة ومتابعة طلبات المتجر وتغيير الحالات")
public class AdminOrderController {

    private final OrderService orderService;

    public AdminOrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @GetMapping
    @Operation(summary = "عرض قائمة طلبات المتجر مع التصفية والترقيم")
    public ResponseEntity<ApiResponse<Page<OrderResponseDto>>> getOrders(
        @RequestParam(required = false) OrderStatus status,
        @PageableDefault(size = 20) Pageable pageable
    ) {
        Page<OrderResponseDto> orders = orderService.getOrders(status, pageable);
        return ResponseEntity.ok(ApiResponse.success(orders));
    }

    @GetMapping("/{id}")
    @Operation(summary = "عرض تفاصيل طلب كاملة للإدارة")
    public ResponseEntity<ApiResponse<OrderResponseDto>> getOrderById(@PathVariable UUID id) {
        OrderResponseDto order = orderService.getOrderById(id);
        return ResponseEntity.ok(ApiResponse.success(order));
    }

    @PostMapping("/{id}/status")
    @Operation(summary = "تحديث حالة الطلب وتوثيق سجل التحويل مع تدقيق الصلاحية")
    public ResponseEntity<ApiResponse<OrderResponseDto>> updateOrderStatus(
        @PathVariable UUID id,
        @Valid @RequestBody UpdateOrderStatusRequest request,
        @RequestHeader(value = "X-Admin-User-Id", required = false) UUID actorId
    ) {
        OrderResponseDto updated = orderService.transitionOrderStatus(id, request.newStatus(), actorId, request.note());
        return ResponseEntity.ok(ApiResponse.success(updated, "تم تحديث حالة الطلب بنجاح"));
    }

    @PatchMapping("/{id}/reschedule")
    @Operation(summary = "تعديل موعد الاستلام وتوثيق السجل لإشعار العميل عبر واتساب")
    public ResponseEntity<ApiResponse<OrderResponseDto>> rescheduleOrder(
        @PathVariable UUID id,
        @RequestBody com.lolocupcakes.orders.dto.RescheduleOrderRequest request
    ) {
        OrderResponseDto updated = orderService.rescheduleOrder(id, request.newDate(), request.newTimeSlotId(), request.note());
        return ResponseEntity.ok(ApiResponse.success(updated, "تم تعديل موعد الطلب بنجاح"));
    }
}
