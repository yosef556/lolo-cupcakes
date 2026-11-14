package com.lolocupcakes.scheduling.repository;

import com.lolocupcakes.scheduling.model.TimeSlot;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TimeSlotRepository extends JpaRepository<TimeSlot, UUID> {

    List<TimeSlot> findBySlotDateAndIsActiveTrueOrderByStartTimeAsc(LocalDate slotDate);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT s FROM TimeSlot s WHERE s.id = :id")
    Optional<TimeSlot> findByIdForUpdate(@Param("id") UUID id);
}
