package com.lolocupcakes.scheduling.service;

import com.lolocupcakes.common.BusinessException;
import com.lolocupcakes.common.ErrorCode;
import com.lolocupcakes.scheduling.dto.TimeSlotAvailabilityDto;
import com.lolocupcakes.scheduling.model.Branch;
import com.lolocupcakes.scheduling.model.CapacityReservation;
import com.lolocupcakes.scheduling.model.TimeSlot;
import com.lolocupcakes.scheduling.repository.BranchRepository;
import com.lolocupcakes.scheduling.repository.CapacityReservationRepository;
import com.lolocupcakes.scheduling.repository.TimeSlotRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
@Transactional
public class SchedulingService {

    private final TimeSlotRepository timeSlotRepository;
    private final CapacityReservationRepository capacityReservationRepository;
    private final BranchRepository branchRepository;

    public SchedulingService(
        TimeSlotRepository timeSlotRepository,
        CapacityReservationRepository capacityReservationRepository,
        BranchRepository branchRepository
    ) {
        this.timeSlotRepository = timeSlotRepository;
        this.capacityReservationRepository = capacityReservationRepository;
        this.branchRepository = branchRepository;
    }

    @Transactional
    public List<TimeSlotAvailabilityDto> getAvailableSlots(LocalDate date, String fulfillmentType, Integer leadTimeHours) {
        if (date == null) {
            date = LocalDate.now(ZoneId.of("Africa/Cairo"));
        }

        List<TimeSlot> slots = timeSlotRepository.findBySlotDateAndIsActiveTrueOrderByStartTimeAsc(date);

        // Auto-generate standard daily slots if none exist for today/requested date in demo/MVP
        if (slots.isEmpty()) {
            slots = generateDefaultDailySlots(date);
        }

        ZoneId cairoZone = ZoneId.of("Africa/Cairo");
        ZonedDateTime nowCairo = ZonedDateTime.now(cairoZone);
        int lead = leadTimeHours != null ? leadTimeHours : 2;

        List<TimeSlotAvailabilityDto> result = new ArrayList<>();
        DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("hh:mm a", Locale.forLanguageTag("ar-EG"));

        for (TimeSlot slot : slots) {
            if (fulfillmentType != null && !fulfillmentType.equalsIgnoreCase("ALL")) {
                if (!slot.getFulfillmentType().equalsIgnoreCase("BOTH") &&
                    !slot.getFulfillmentType().equalsIgnoreCase(fulfillmentType)) {
                    continue;
                }
            }

            int reserved = capacityReservationRepository.countActiveReservations(slot.getId());
            int remaining = Math.max(0, slot.getMaxCapacity() - reserved);

            // Check if slot has already passed today in Cairo time
            boolean isPastToday = date.isEqual(nowCairo.toLocalDate()) && nowCairo.toLocalTime().isAfter(slot.getEndTime());
            boolean isAvailable = (remaining > 0) && !isPastToday && Boolean.TRUE.equals(slot.getIsActive());

            String timeDisplay = slot.getStartTime().format(timeFormatter) + " - " + slot.getEndTime().format(timeFormatter);

            result.add(new TimeSlotAvailabilityDto(
                slot.getId(),
                slot.getSlotDate(),
                slot.getStartTime(),
                slot.getEndTime(),
                timeDisplay,
                slot.getFulfillmentType(),
                slot.getMaxCapacity(),
                reserved,
                remaining,
                isAvailable
            ));
        }

        return result;
    }

    public List<TimeSlot> generateDefaultDailySlots(LocalDate date) {
        Branch branch = branchRepository.findFirstByIsActiveTrue()
            .orElseGet(() -> branchRepository.save(new Branch("فرع المعادي الرئيسي", "شارع 9 الرئيسي، المعادي، القاهرة", "01069915609")));

        List<TimeSlot> created = new ArrayList<>();
        LocalTime[][] ranges = {
            {LocalTime.of(10, 0), LocalTime.of(12, 0)},
            {LocalTime.of(12, 0), LocalTime.of(14, 0)},
            {LocalTime.of(14, 0), LocalTime.of(16, 0)},
            {LocalTime.of(16, 0), LocalTime.of(18, 0)},
            {LocalTime.of(18, 0), LocalTime.of(20, 0)},
            {LocalTime.of(20, 0), LocalTime.of(22, 0)}
        };

        for (LocalTime[] range : ranges) {
            TimeSlot slot = new TimeSlot(branch.getId(), date, range[0], range[1], "BOTH", 25);
            created.add(timeSlotRepository.save(slot));
        }
        return created;
    }

    /**
     * Atomically reserves capacity for a slot inside a database transaction with pessimistic locking
     */
    public CapacityReservation reserveCapacityAtomic(UUID slotId, UUID orderId, int count) {
        TimeSlot slot = timeSlotRepository.findByIdForUpdate(slotId)
            .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "الفترة الزمنية المحددة غير موجودة"));

        if (!Boolean.TRUE.equals(slot.getIsActive())) {
            throw new BusinessException(ErrorCode.SLOT_CAPACITY_EXCEEDED, "الفترة الزمنية غير متاحة");
        }

        int activeReserved = capacityReservationRepository.countActiveReservations(slotId);
        if (activeReserved + count > slot.getMaxCapacity()) {
            throw new BusinessException(
                ErrorCode.SLOT_CAPACITY_EXCEEDED,
                "عذراً، الفترة الزمنية المطلوبة (" + slot.getStartTime() + " - " + slot.getEndTime() + ") اكتملت سعتها بالكامل"
            );
        }

        CapacityReservation reservation = new CapacityReservation(slotId, orderId, count);
        return capacityReservationRepository.save(reservation);
    }

    public void cancelReservation(UUID orderId) {
        capacityReservationRepository.findByOrderId(orderId).ifPresent(r -> {
            r.setStatus("CANCELLED");
            capacityReservationRepository.save(r);
        });
    }

    @Transactional(readOnly = true)
    public Branch getCurrentBranch() {
        return branchRepository.findFirstByIsActiveTrue()
            .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "لا يوجد فرع نشط حالياً"));
    }
}
