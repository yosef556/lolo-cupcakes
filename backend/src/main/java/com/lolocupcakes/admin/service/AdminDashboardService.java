package com.lolocupcakes.admin.service;

import com.lolocupcakes.admin.dto.DashboardMetricsDto;
import com.lolocupcakes.customcakes.model.CustomCakeStatus;
import com.lolocupcakes.customcakes.repository.CustomCakeRequestRepository;
import com.lolocupcakes.orders.dto.OrderResponseDto;
import com.lolocupcakes.orders.model.Order;
import com.lolocupcakes.orders.model.OrderStatus;
import com.lolocupcakes.orders.model.PaymentStatus;
import com.lolocupcakes.orders.repository.OrderRepository;
import com.lolocupcakes.orders.repository.PaymentRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class AdminDashboardService {

    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;
    private final CustomCakeRequestRepository customCakeRequestRepository;

    public AdminDashboardService(
        OrderRepository orderRepository,
        PaymentRepository paymentRepository,
        CustomCakeRequestRepository customCakeRequestRepository
    ) {
        this.orderRepository = orderRepository;
        this.paymentRepository = paymentRepository;
        this.customCakeRequestRepository = customCakeRequestRepository;
    }

    public DashboardMetricsDto getMetrics() {
        long totalOrders = orderRepository.count();
        long pendingOrders = orderRepository.countByOrderStatus(OrderStatus.PENDING);
        long pendingPayments = paymentRepository.countByStatus("PENDING_VERIFICATION");
        long pendingCustomCakes = customCakeRequestRepository.countByStatus(CustomCakeStatus.SUBMITTED);

        List<Order> allOrders = orderRepository.findAll();
        LocalDate todayCairo = LocalDate.now(ZoneId.of("Africa/Cairo"));

        long todayOrders = 0;
        BigDecimal totalSales = BigDecimal.ZERO;
        BigDecimal todaySales = BigDecimal.ZERO;

        for (Order o : allOrders) {
            LocalDate orderDate = o.getCreatedAt().atZone(ZoneId.of("Africa/Cairo")).toLocalDate();
            if (orderDate.equals(todayCairo)) {
                todayOrders++;
            }
            if (o.getPaymentStatus() == PaymentStatus.PAID) {
                totalSales = totalSales.add(o.getTotalAmount());
                if (orderDate.equals(todayCairo)) {
                    todaySales = todaySales.add(o.getTotalAmount());
                }
            }
        }

        List<OrderResponseDto> recentOrders = orderRepository.findAllByOrderByCreatedAtDesc(PageRequest.of(0, 5))
            .getContent()
            .stream()
            .map(OrderResponseDto::fromEntity)
            .toList();

        return new DashboardMetricsDto(
            totalOrders,
            todayOrders,
            pendingOrders,
            pendingPayments,
            pendingCustomCakes,
            totalSales,
            todaySales,
            recentOrders
        );
    }
}
