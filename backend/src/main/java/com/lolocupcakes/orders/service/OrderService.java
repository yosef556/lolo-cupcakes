package com.lolocupcakes.orders.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.lolocupcakes.cart.dto.CartItemDto;
import com.lolocupcakes.cart.dto.CheckoutQuoteRequest;
import com.lolocupcakes.cart.dto.CheckoutQuoteResponse;
import com.lolocupcakes.cart.model.Cart;
import com.lolocupcakes.cart.model.CartItem;
import com.lolocupcakes.cart.service.CartService;
import com.lolocupcakes.cart.service.PricingService;
import com.lolocupcakes.common.BusinessException;
import com.lolocupcakes.common.ErrorCode;
import com.lolocupcakes.fulfillment.model.DeliveryZone;
import com.lolocupcakes.fulfillment.repository.DeliveryZoneRepository;
import com.lolocupcakes.orders.dto.CreateOrderRequest;
import com.lolocupcakes.orders.dto.OrderResponseDto;
import com.lolocupcakes.orders.dto.OrderTrackingDto;
import com.lolocupcakes.orders.model.*;
import com.lolocupcakes.orders.repository.OrderItemRepository;
import com.lolocupcakes.orders.repository.OrderRepository;
import com.lolocupcakes.orders.repository.OrderStatusHistoryRepository;
import com.lolocupcakes.orders.repository.PaymentRepository;
import com.lolocupcakes.scheduling.model.CapacityReservation;
import com.lolocupcakes.scheduling.model.TimeSlot;
import com.lolocupcakes.scheduling.repository.CapacityReservationRepository;
import com.lolocupcakes.scheduling.repository.TimeSlotRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.lolocupcakes.auth.repository.CustomerRepository;
import java.security.SecureRandom;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@Transactional
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final OrderStatusHistoryRepository orderStatusHistoryRepository;
    private final PaymentRepository paymentRepository;
    private final CartService cartService;
    private final PricingService pricingService;
    private final TimeSlotRepository timeSlotRepository;
    private final CapacityReservationRepository capacityReservationRepository;
    private final DeliveryZoneRepository deliveryZoneRepository;
    private final ObjectMapper objectMapper;
    private final CustomerRepository customerRepository;
    private final SecureRandom random = new SecureRandom();

    public OrderService(
        OrderRepository orderRepository,
        OrderItemRepository orderItemRepository,
        OrderStatusHistoryRepository orderStatusHistoryRepository,
        PaymentRepository paymentRepository,
        CartService cartService,
        PricingService pricingService,
        TimeSlotRepository timeSlotRepository,
        CapacityReservationRepository capacityReservationRepository,
        DeliveryZoneRepository deliveryZoneRepository,
        ObjectMapper objectMapper,
        CustomerRepository customerRepository
    ) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.orderStatusHistoryRepository = orderStatusHistoryRepository;
        this.paymentRepository = paymentRepository;
        this.cartService = cartService;
        this.pricingService = pricingService;
        this.timeSlotRepository = timeSlotRepository;
        this.capacityReservationRepository = capacityReservationRepository;
        this.deliveryZoneRepository = deliveryZoneRepository;
        this.objectMapper = objectMapper;
        this.customerRepository = customerRepository;
    }

    public OrderResponseDto createOrder(CreateOrderRequest request) {
        // 1. Idempotency Check: prevent duplicate submissions
        Optional<Order> existingOrder = orderRepository.findByIdempotencyKey(request.idempotencyKey());
        if (existingOrder.isPresent()) {
            return OrderResponseDto.fromEntity(existingOrder.get());
        }

        // 2. Validate Cart
        Cart cart = cartService.getOrCreateCartEntity(request.cartToken());
        if (cart.getItems().isEmpty()) {
            throw new BusinessException(ErrorCode.VALIDATION_FAILED, "سلة التسوق فارغة، لا يمكن إنشاء طلب");
        }

        // 3. Server Authoritative Pricing Calculation
        CheckoutQuoteRequest quoteRequest = new CheckoutQuoteRequest(
            request.cartToken(),
            request.fulfillmentType().name(),
            request.deliveryZoneId(),
            request.couponCode()
        );
        CheckoutQuoteResponse quote = pricingService.calculateAuthoritativeQuote(cart, quoteRequest);

        // 4. Atomic Time Slot Capacity Reservation (Pessimistic write lock)
        TimeSlot slot = timeSlotRepository.findByIdForUpdate(request.timeSlotId())
            .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "الفترة الزمنية المحددة غير موجودة"));

        if (!Boolean.TRUE.equals(slot.getIsActive())) {
            throw new BusinessException(ErrorCode.SLOT_CAPACITY_EXCEEDED, "الفترة الزمنية غير متاحة");
        }

        int activeReserved = capacityReservationRepository.countActiveReservations(slot.getId());
        if (activeReserved >= slot.getMaxCapacity()) {
            throw new BusinessException(
                ErrorCode.SLOT_CAPACITY_EXCEEDED,
                "عذراً، الفترة الزمنية المطلوبة (" + slot.getStartTime() + " - " + slot.getEndTime() + ") اكتملت سعتها بالكامل"
            );
        }

        // 5. Generate Secure Public Identifiers
        String orderNumber = generatePublicOrderNumber();
        String trackingToken = UUID.randomUUID().toString().replace("-", "");

        // 6. Address Snapshot
        String addressSnapshot = null;
        if (request.fulfillmentType() == FulfillmentType.DELIVERY) {
            Map<String, String> addressMap = Map.of(
                "zoneId", request.deliveryZoneId() != null ? request.deliveryZoneId().toString() : "",
                "streetAddress", request.streetAddress() != null ? request.streetAddress() : "",
                "buildingNumber", request.buildingNumber() != null ? request.buildingNumber() : "",
                "floorDoor", request.floorDoor() != null ? request.floorDoor() : "",
                "landmark", request.landmark() != null ? request.landmark() : ""
            );
            try {
                addressSnapshot = objectMapper.writeValueAsString(addressMap);
            } catch (Exception ignored) {
            }
        }

        // 7. Persist Order
        Order order = new Order();
        order.setPublicOrderNumber(orderNumber);
        order.setTrackingToken(trackingToken);
        order.setIdempotencyKey(request.idempotencyKey());
        order.setCustomerName(request.customerName());
        order.setCustomerPhone(request.customerPhone());
        if (request.customerPhone() != null && !request.customerPhone().isBlank()) {
            customerRepository.findByPhone(request.customerPhone().trim()).ifPresent(c -> {
                order.setCustomerId(c.getId());
            });
        }
        order.setFulfillmentType(request.fulfillmentType());
        order.setBranchId(slot.getBranchId());
        order.setDeliveryZoneId(request.deliveryZoneId());
        order.setDeliveryAddressSnapshot(addressSnapshot);
        order.setTimeSlotId(slot.getId());
        order.setScheduledForDate(slot.getSlotDate());
        order.setScheduledForTimeRange(slot.getStartTime() + " - " + slot.getEndTime());
        order.setSubtotal(quote.subtotal());
        order.setDiscountAmount(quote.discountAmount());
        order.setDeliveryFee(quote.deliveryFee());
        order.setTotalAmount(quote.totalAmount());
        order.setCurrency("EGP");
        if (request.paymentMethod() == PaymentMethod.CARD_ONLINE) {
            order.setOrderStatus(OrderStatus.CONFIRMED);
            order.setPaymentStatus(PaymentStatus.PAID);
        } else if (request.paymentMethod() == PaymentMethod.CASH) {
            order.setOrderStatus(OrderStatus.CONFIRMED);
            order.setPaymentStatus(PaymentStatus.UNPAID);
        } else {
            order.setOrderStatus(OrderStatus.PENDING);
            order.setPaymentStatus(PaymentStatus.UNPAID);
        }
        order.setPaymentMethod(request.paymentMethod());
        order.setCustomerNotes(request.customerNotes());

        Order savedOrder = orderRepository.save(order);

        // 8. Persist Order Items with Snapshots
        for (CartItem ci : cart.getItems()) {
            CartItemDto calculated = pricingService.calculateItemPrice(ci);
            OrderItem item = new OrderItem(
                savedOrder,
                ci.getProduct().getId(),
                ci.getVariant() != null ? ci.getVariant().getId() : null,
                ci.getProduct().getNameAr(),
                ci.getVariant() != null ? ci.getVariant().getNameAr() : null,
                calculated.unitPrice(),
                ci.getQuantity(),
                calculated.lineTotal(),
                ci.getSelectedConfiguration(),
                "{}",
                "{}"
            );
            orderItemRepository.save(item);
        }

        // 9. Link Capacity Reservation
        CapacityReservation reservation = new CapacityReservation(slot.getId(), savedOrder.getId(), 1);
        capacityReservationRepository.save(reservation);

        // 10. Initialize Payment Record
        Payment payment = new Payment(savedOrder.getId(), request.paymentMethod().name(), quote.totalAmount());
        if (request.paymentMethod() == PaymentMethod.CARD_ONLINE) {
            payment.setStatus(PaymentStatus.PAID.name());
            payment.setPaymentReference("PAYMOB-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        } else if (request.paymentMethod() == PaymentMethod.MANUAL_TRANSFER) {
            payment.setStatus(PaymentStatus.PENDING_VERIFICATION.name());
        }
        paymentRepository.save(payment);

        // 11. Initial Status History Event
        String historyNote = request.paymentMethod() == PaymentMethod.CARD_ONLINE
            ? "تم سداد الطلب بالبطاقة البنكية أونلاين وتأكيده آلياً للبدء في التجهيز"
            : request.paymentMethod() == PaymentMethod.CASH
            ? "تم تأكيد طلب الدفع عند الاستلام وبدء الجدولة"
            : "تم إنشاء الطلب بنجاح وبانتظار رفع إيصال التحويل للمراجعة";

        OrderStatusHistory history = new OrderStatusHistory(
            savedOrder,
            null,
            savedOrder.getOrderStatus().name(),
            null,
            historyNote
        );
        orderStatusHistoryRepository.save(history);

        // 12. Clear Cart
        cartService.clearCart(cart);

        return OrderResponseDto.fromEntity(savedOrder);
    }

    @Transactional(readOnly = true)
    public OrderTrackingDto getOrderTracking(String publicOrderNumber, String trackingToken) {
        Order order = orderRepository.findByPublicOrderNumber(publicOrderNumber)
            .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "الطلب غير موجود"));

        if (trackingToken != null && !trackingToken.isBlank() && !order.getTrackingToken().equals(trackingToken)) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED_ACCESS, "رمز تتبع الطلب غير صحيح");
        }

        List<OrderStatusHistory> history = orderStatusHistoryRepository.findByOrderIdOrderByCreatedAtDesc(order.getId());
        return OrderTrackingDto.fromEntity(order, history);
    }

    @Transactional(readOnly = true)
    public List<OrderTrackingDto> lookupOrdersByQuery(String query) {
        if (query == null || query.isBlank()) {
            return List.of();
        }
        String q = query.trim();
        List<Order> found = new ArrayList<>();
        orderRepository.findByPublicOrderNumber(q).ifPresent(found::add);
        if (found.isEmpty()) {
            found.addAll(orderRepository.findByCustomerPhoneOrderByCreatedAtDesc(q));
        }
        return found.stream().map(o -> {
            List<OrderStatusHistory> history = orderStatusHistoryRepository.findByOrderIdOrderByCreatedAtDesc(o.getId());
            return OrderTrackingDto.fromEntity(o, history);
        }).toList();
    }

    public OrderTrackingDto cancelOrderByCustomer(String publicOrderNumber, String reason) {
        Order order = orderRepository.findByPublicOrderNumber(publicOrderNumber)
            .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "الطلب غير موجود"));

        if (order.getOrderStatus() != OrderStatus.PENDING) {
            throw new BusinessException(ErrorCode.VALIDATION_FAILED, "لا يمكن إلغاء الطلب بعد اعتماده أو البدء في تجهيزه");
        }

        order.setOrderStatus(OrderStatus.CANCELLED);
        Order saved = orderRepository.save(order);

        String note = "تم إلغاء الطلب من قِبل العميل" + (reason != null && !reason.isBlank() ? " (السبب: " + reason.trim() + ")" : "");
        OrderStatusHistory history = new OrderStatusHistory(
            saved,
            OrderStatus.PENDING.name(),
            OrderStatus.CANCELLED.name(),
            null,
            note
        );
        orderStatusHistoryRepository.save(history);

        List<OrderStatusHistory> histories = orderStatusHistoryRepository.findByOrderIdOrderByCreatedAtDesc(saved.getId());
        return OrderTrackingDto.fromEntity(saved, histories);
    }

    public OrderResponseDto transitionOrderStatus(UUID orderId, OrderStatus newStatus, UUID actorId, String note) {
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "الطلب غير موجود"));

        boolean isPickup = (order.getFulfillmentType() == FulfillmentType.PICKUP);
        if (!order.getOrderStatus().canTransitionTo(newStatus, isPickup)) {
            throw new BusinessException(
                ErrorCode.INVALID_STATE_TRANSITION,
                "لا يمكن تحويل حالة الطلب من " + order.getOrderStatus().getLabelAr() + " إلى " + newStatus.getLabelAr()
            );
        }

        String oldStatus = order.getOrderStatus().name();
        order.setOrderStatus(newStatus);
        Order updated = orderRepository.save(order);

        OrderStatusHistory history = new OrderStatusHistory(
            updated,
            oldStatus,
            newStatus.name(),
            actorId,
            note
        );
        orderStatusHistoryRepository.save(history);

        // If cancelled, release capacity reservation
        if (newStatus == OrderStatus.CANCELLED || newStatus == OrderStatus.REJECTED) {
            capacityReservationRepository.findByOrderId(orderId).ifPresent(r -> {
                r.setStatus("CANCELLED");
                capacityReservationRepository.save(r);
            });
        }

        return OrderResponseDto.fromEntity(updated);
    }

    @Transactional(readOnly = true)
    public org.springframework.data.domain.Page<OrderResponseDto> getOrders(OrderStatus status, org.springframework.data.domain.Pageable pageable) {
        org.springframework.data.domain.Page<Order> page;
        if (status != null) {
            page = orderRepository.findByOrderStatusOrderByCreatedAtDesc(status, pageable);
        } else {
            page = orderRepository.findAllByOrderByCreatedAtDesc(pageable);
        }
        return page.map(OrderResponseDto::fromEntity);
    }

    @Transactional(readOnly = true)
    public OrderResponseDto getOrderById(UUID orderId) {
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "الطلب غير موجود"));
        return OrderResponseDto.fromEntity(order);
    }

    public OrderResponseDto rescheduleOrder(UUID orderId, LocalDate newDate, String newTimeSlotId, String note) {
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "الطلب غير موجود"));

        LocalDate oldDate = order.getScheduledForDate();
        String oldTime = order.getScheduledForTimeRange();

        if (newDate != null) {
            order.setScheduledForDate(newDate);
        }

        if (newTimeSlotId != null && !newTimeSlotId.isBlank()) {
            try {
                TimeSlot slot = timeSlotRepository.findById(UUID.fromString(newTimeSlotId)).orElse(null);
                if (slot != null) {
                    order.setTimeSlotId(slot.getId());
                    order.setScheduledForTimeRange(slot.getStartTime() + " - " + slot.getEndTime());
                }
            } catch (Exception ignored) {}
        }

        String historyNote = "تم تعديل موعد التسليم من (" + oldDate + " " + oldTime + ") إلى (" + order.getScheduledForDate() + " " + order.getScheduledForTimeRange() + ")";
        if (note != null && !note.isBlank()) {
            historyNote += " - ملاحظة: " + note;
        }

        OrderStatusHistory history = new OrderStatusHistory(
            order,
            order.getOrderStatus().name(),
            order.getOrderStatus().name(),
            null,
            historyNote
        );
        orderStatusHistoryRepository.save(history);

        Order updated = orderRepository.save(order);
        return OrderResponseDto.fromEntity(updated);
    }

    private String generatePublicOrderNumber() {
        String datePart = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        int randPart = 1000 + random.nextInt(9000);
        return "LC-" + datePart + "-" + randPart;
    }
}
