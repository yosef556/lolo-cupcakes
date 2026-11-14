package com.lolocupcakes.orders.controller;

import com.lolocupcakes.common.ApiResponse;
import com.lolocupcakes.orders.dto.CreateOrderRequest;
import com.lolocupcakes.orders.dto.OrderResponseDto;
import com.lolocupcakes.orders.dto.OrderTrackingDto;
import com.lolocupcakes.orders.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/orders")
@Tag(name = "Orders", description = "واجهات إنشاء وتتبع الطلبات للعملاء والزوار")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping
    @Operation(summary = "إنشاء طلب جديد مع التحقق الصارم من الحسابات وحجز السعة")
    public ResponseEntity<ApiResponse<OrderResponseDto>> createOrder(
        @RequestHeader(value = "Idempotency-Key", required = false) String idempotencyHeader,
        @Valid @RequestBody CreateOrderRequest request
    ) {
        // If header is provided and body has none or different, prefer header
        String key = idempotencyHeader != null && !idempotencyHeader.isBlank() ? idempotencyHeader : request.idempotencyKey();
        CreateOrderRequest effectiveRequest = request;
        if (key != null && !key.equals(request.idempotencyKey())) {
            effectiveRequest = new CreateOrderRequest(
                key,
                request.cartToken(),
                request.customerName(),
                request.customerPhone(),
                request.fulfillmentType(),
                request.deliveryZoneId(),
                request.streetAddress(),
                request.buildingNumber(),
                request.floorDoor(),
                request.landmark(),
                request.timeSlotId(),
                request.paymentMethod(),
                request.customerNotes(),
                request.couponCode()
            );
        }

        OrderResponseDto response = orderService.createOrder(effectiveRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(response, "تم إنشاء الطلب بنجاح"));
    }

    @GetMapping("/{publicOrderNumber}/tracking")
    @Operation(summary = "تتبع الطلب برقم الطلب الظاهر ورمز التتبع السري أو رقم الطلب مباشرة")
    public ResponseEntity<ApiResponse<OrderTrackingDto>> trackOrder(
        @PathVariable String publicOrderNumber,
        @RequestParam(name = "token", required = false) String trackingToken
    ) {
        OrderTrackingDto dto = orderService.getOrderTracking(publicOrderNumber, trackingToken);
        return ResponseEntity.ok(ApiResponse.success(dto));
    }

    @GetMapping("/lookup")
    @Operation(summary = "البحث السريع عن الطلبات للعميل برقم الهاتف أو رقم الطلب")
    public ResponseEntity<ApiResponse<java.util.List<OrderTrackingDto>>> lookupOrders(
        @RequestParam(name = "query") String query
    ) {
        java.util.List<OrderTrackingDto> list = orderService.lookupOrdersByQuery(query);
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    public record CancelOrderRequest(String reason) {}

    @PostMapping("/{publicOrderNumber}/cancel")
    @Operation(summary = "إلغاء الطلب من قِبل العميل إذا كان قيد المراجعة")
    public ResponseEntity<ApiResponse<OrderTrackingDto>> cancelOrder(
        @PathVariable String publicOrderNumber,
        @RequestBody(required = false) CancelOrderRequest request
    ) {
        String reason = request != null ? request.reason() : null;
        OrderTrackingDto dto = orderService.cancelOrderByCustomer(publicOrderNumber, reason);
        return ResponseEntity.ok(ApiResponse.success(dto, "تم إلغاء الطلب بنجاح"));
    }
}
