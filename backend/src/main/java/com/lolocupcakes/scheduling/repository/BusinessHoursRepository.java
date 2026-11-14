package com.lolocupcakes.scheduling.repository;

import com.lolocupcakes.scheduling.model.BusinessHours;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface BusinessHoursRepository extends JpaRepository<BusinessHours, UUID> {
    List<BusinessHours> findByBranchId(UUID branchId);
    Optional<BusinessHours> findByBranchIdAndDayOfWeek(UUID branchId, Integer dayOfWeek);
}
