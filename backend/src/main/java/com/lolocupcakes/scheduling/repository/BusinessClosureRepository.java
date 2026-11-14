package com.lolocupcakes.scheduling.repository;

import com.lolocupcakes.scheduling.model.BusinessClosure;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Repository
public interface BusinessClosureRepository extends JpaRepository<BusinessClosure, UUID> {
    @Query("""
        SELECT c FROM BusinessClosure c
        WHERE c.branchId = :branchId
        AND c.endDatetime >= :startInstant
        AND c.startDatetime <= :endInstant
    """)
    List<BusinessClosure> findOverlappingClosures(
        @Param("branchId") UUID branchId,
        @Param("startInstant") Instant startInstant,
        @Param("endInstant") Instant endInstant
    );
}
