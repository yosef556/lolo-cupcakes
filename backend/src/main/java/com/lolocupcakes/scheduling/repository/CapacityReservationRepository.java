package com.lolocupcakes.scheduling.repository;

import com.lolocupcakes.scheduling.model.CapacityReservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface CapacityReservationRepository extends JpaRepository<CapacityReservation, UUID> {

    @Query("SELECT COALESCE(SUM(cr.reservedCount), 0) FROM CapacityReservation cr WHERE cr.timeSlotId = :slotId AND cr.status = 'CONFIRMED'")
    int countActiveReservations(@Param("slotId") UUID slotId);

    Optional<CapacityReservation> findByOrderId(UUID orderId);
}
