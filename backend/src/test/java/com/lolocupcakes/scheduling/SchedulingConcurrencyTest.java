package com.lolocupcakes.scheduling;

import com.lolocupcakes.common.BusinessException;
import com.lolocupcakes.common.ErrorCode;
import com.lolocupcakes.scheduling.model.Branch;
import com.lolocupcakes.scheduling.model.TimeSlot;
import com.lolocupcakes.scheduling.repository.BranchRepository;
import com.lolocupcakes.scheduling.repository.CapacityReservationRepository;
import com.lolocupcakes.scheduling.repository.TimeSlotRepository;
import com.lolocupcakes.scheduling.service.SchedulingService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicInteger;

import static org.junit.jupiter.api.Assertions.assertEquals;

@SpringBootTest
public class SchedulingConcurrencyTest {

    @Autowired
    private SchedulingService schedulingService;

    @Autowired
    private TimeSlotRepository timeSlotRepository;

    @Autowired
    private CapacityReservationRepository capacityReservationRepository;

    @Autowired
    private BranchRepository branchRepository;

    @Autowired
    private com.lolocupcakes.orders.repository.OrderRepository orderRepository;

    @Test
    void testAtomicCapacityPreventsOverbookingUnderConcurrency() throws InterruptedException {
        Branch branch = branchRepository.findFirstByIsActiveTrue()
            .orElseGet(() -> branchRepository.save(new Branch("فرع الاختبار", "القاهرة", "01000000000")));

        // Create a time slot with STRICT maxCapacity = 1
        TimeSlot slot = new TimeSlot(
            branch.getId(),
            LocalDate.now().plusDays(2),
            LocalTime.of(14, 0),
            LocalTime.of(16, 0),
            "BOTH",
            1
        );
        TimeSlot savedSlot = timeSlotRepository.save(slot);

        int numberOfConcurrentRequests = 5;
        List<com.lolocupcakes.orders.model.Order> testOrders = new ArrayList<>();
        for (int i = 0; i < numberOfConcurrentRequests; i++) {
            com.lolocupcakes.orders.model.Order order = new com.lolocupcakes.orders.model.Order();
            order.setPublicOrderNumber("LC-TEST-" + UUID.randomUUID().toString().substring(0, 8));
            order.setTrackingToken(UUID.randomUUID().toString().replace("-", ""));
            order.setIdempotencyKey("KEY-" + UUID.randomUUID());
            order.setCustomerName("عميل تجريبي");
            order.setCustomerPhone("01012345678");
            order.setFulfillmentType(com.lolocupcakes.orders.model.FulfillmentType.PICKUP);
            order.setBranchId(branch.getId());
            order.setTimeSlotId(savedSlot.getId());
            order.setScheduledForDate(savedSlot.getSlotDate());
            order.setScheduledForTimeRange(savedSlot.getStartTime() + " - " + savedSlot.getEndTime());
            order.setSubtotal(java.math.BigDecimal.valueOf(100));
            order.setTotalAmount(java.math.BigDecimal.valueOf(100));
            order.setPaymentMethod(com.lolocupcakes.orders.model.PaymentMethod.CASH);
            testOrders.add(orderRepository.save(order));
        }

        ExecutorService executor = Executors.newFixedThreadPool(numberOfConcurrentRequests);
        CountDownLatch startLatch = new CountDownLatch(1);
        CountDownLatch doneLatch = new CountDownLatch(numberOfConcurrentRequests);

        AtomicInteger successCount = new AtomicInteger(0);
        AtomicInteger capacityExceededCount = new AtomicInteger(0);
        List<Throwable> unexpectedErrors = Collections.synchronizedList(new ArrayList<>());

        for (int i = 0; i < numberOfConcurrentRequests; i++) {
            final int index = i;
            executor.submit(() -> {
                try {
                    startLatch.await(); // Wait for all threads to synchronize
                    schedulingService.reserveCapacityAtomic(savedSlot.getId(), testOrders.get(index).getId(), 1);
                    successCount.incrementAndGet();
                } catch (BusinessException ex) {
                    if (ex.getErrorCode() == ErrorCode.SLOT_CAPACITY_EXCEEDED) {
                        capacityExceededCount.incrementAndGet();
                    } else {
                        unexpectedErrors.add(ex);
                    }
                } catch (Exception ex) {
                    unexpectedErrors.add(ex);
                } finally {
                    doneLatch.countDown();
                }
            });
        }

        startLatch.countDown(); // Trigger all threads simultaneously
        doneLatch.await(); // Wait for completion
        executor.shutdown();

        // Verification: Exactly 1 reservation succeeded, 4 were rejected due to capacity limit
        assertEquals(0, unexpectedErrors.size(), "No unexpected errors should occur");
        assertEquals(1, successCount.get(), "Only 1 request must successfully claim the last slot capacity");
        assertEquals(4, capacityExceededCount.get(), "All other concurrent requests must be rejected with capacity exceeded");

        // Verify database state: Total confirmed count is strictly 1
        int confirmedInDb = capacityReservationRepository.countActiveReservations(savedSlot.getId());
        assertEquals(1, confirmedInDb, "Total reservations in DB must not exceed capacity under concurrency");
    }
}
