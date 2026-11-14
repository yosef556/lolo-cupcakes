package com.lolocupcakes.orders.repository;

import com.lolocupcakes.orders.model.Order;
import com.lolocupcakes.orders.model.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface OrderRepository extends JpaRepository<Order, UUID> {
    Optional<Order> findByPublicOrderNumber(String publicOrderNumber);
    Optional<Order> findByTrackingToken(String trackingToken);
    Optional<Order> findByIdempotencyKey(String idempotencyKey);
    Page<Order> findAllByOrderByCreatedAtDesc(Pageable pageable);
    Page<Order> findByOrderStatusOrderByCreatedAtDesc(OrderStatus orderStatus, Pageable pageable);
    long countByOrderStatus(OrderStatus orderStatus);
    java.util.List<Order> findByCustomerPhoneOrderByCreatedAtDesc(String customerPhone);
}
