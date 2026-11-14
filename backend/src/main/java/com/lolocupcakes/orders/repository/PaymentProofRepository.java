package com.lolocupcakes.orders.repository;

import com.lolocupcakes.orders.model.PaymentProof;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PaymentProofRepository extends JpaRepository<PaymentProof, UUID> {
    List<PaymentProof> findByPaymentIdOrderByUploadedAtDesc(UUID paymentId);
}
