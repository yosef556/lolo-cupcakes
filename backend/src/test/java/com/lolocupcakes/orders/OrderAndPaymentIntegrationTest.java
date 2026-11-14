package com.lolocupcakes.orders;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.lolocupcakes.cart.dto.AddToCartRequest;
import com.lolocupcakes.fulfillment.model.DeliveryZone;
import com.lolocupcakes.fulfillment.repository.DeliveryZoneRepository;
import com.lolocupcakes.orders.dto.CreateOrderRequest;
import com.lolocupcakes.orders.dto.PaymentReviewRequest;
import com.lolocupcakes.orders.model.FulfillmentType;
import com.lolocupcakes.orders.model.PaymentMethod;
import com.lolocupcakes.scheduling.dto.TimeSlotAvailabilityDto;
import com.lolocupcakes.scheduling.service.SchedulingService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class OrderAndPaymentIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private DeliveryZoneRepository deliveryZoneRepository;

    @Autowired
    private com.lolocupcakes.scheduling.repository.TimeSlotRepository timeSlotRepository;

    @Autowired
    private com.lolocupcakes.scheduling.repository.BranchRepository branchRepository;

    @Test
    void testEndToEndOrderPlacementAndManualPaymentVerificationFlow() throws Exception {
        // 1. Ensure isolated available time slot
        com.lolocupcakes.scheduling.model.Branch branch = branchRepository.findFirstByIsActiveTrue()
            .orElseGet(() -> branchRepository.save(new com.lolocupcakes.scheduling.model.Branch("فرع المعادي", "القاهرة", "01000000000")));

        com.lolocupcakes.scheduling.model.TimeSlot freshSlot = timeSlotRepository.save(new com.lolocupcakes.scheduling.model.TimeSlot(
            branch.getId(),
            LocalDate.now().plusDays(5),
            java.time.LocalTime.of(10, 0),
            java.time.LocalTime.of(12, 0),
            "BOTH",
            10
        ));
        UUID slotId = freshSlot.getId();

        // 2. Create Cart and Add item
        MvcResult cartResult = mockMvc.perform(post("/api/v1/carts")
                .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andReturn();
        String cartToken = objectMapper.readTree(cartResult.getResponse().getContentAsString())
            .path("data").path("cartToken").asText();

        UUID cupcakeId = UUID.fromString("f0000001-0000-0000-0000-000000000001");
        AddToCartRequest addItem = new AddToCartRequest(cupcakeId, null, 2, List.of(), List.of(), null);
        mockMvc.perform(post("/api/v1/carts/" + cartToken + "/items")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(addItem)))
            .andExpect(status().isOk());

        // 3. Create Delivery Zone
        DeliveryZone zone = deliveryZoneRepository.save(new DeliveryZone(
            "المعادي",
            BigDecimal.valueOf(35.00),
            BigDecimal.valueOf(50.00),
            1
        ));

        // 4. Place Order via POST /api/v1/orders
        String idempotencyKey = "IDEM-" + UUID.randomUUID();
        CreateOrderRequest orderRequest = new CreateOrderRequest(
            idempotencyKey,
            cartToken,
            "أحمد محمود",
            "01012345678",
            FulfillmentType.DELIVERY,
            zone.getId(),
            "شارع 9",
            "عمارة 12",
            "شقة 4 الدور الثاني",
            "بجوار محطة المترو",
            slotId,
            PaymentMethod.MANUAL_TRANSFER,
            "يرجى تغليف العلبة كهدية",
            null
        );

        MvcResult orderResult = mockMvc.perform(post("/api/v1/orders")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(orderRequest)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.publicOrderNumber").isNotEmpty())
            .andExpect(jsonPath("$.data.trackingToken").isNotEmpty())
            .andExpect(jsonPath("$.data.orderStatus").value("PENDING"))
            .andExpect(jsonPath("$.data.paymentStatus").value("UNPAID"))
            .andExpect(jsonPath("$.data.subtotal").value(90.00))
            .andExpect(jsonPath("$.data.deliveryFee").value(35.00))
            .andExpect(jsonPath("$.data.totalAmount").value(125.00))
            .andReturn();

        JsonNode orderData = objectMapper.readTree(orderResult.getResponse().getContentAsString()).path("data");
        String publicOrderNumber = orderData.path("publicOrderNumber").asText();
        String trackingToken = orderData.path("trackingToken").asText();
        UUID orderId = UUID.fromString(orderData.path("id").asText());

        // 5. Test Idempotency Replay (submitting again returns original order without duplicate)
        mockMvc.perform(post("/api/v1/orders")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(orderRequest)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.data.publicOrderNumber").value(publicOrderNumber))
            .andExpect(jsonPath("$.data.id").value(orderId.toString()));

        // 6. Test Tracking Endpoint with valid token
        mockMvc.perform(get("/api/v1/orders/" + publicOrderNumber + "/tracking")
                .param("token", trackingToken))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.publicOrderNumber").value(publicOrderNumber))
            .andExpect(jsonPath("$.data.orderStatus").value("PENDING"))
            .andExpect(jsonPath("$.data.timeline", not(empty())));

        // 7. Test Tracking Endpoint with invalid token -> 401
        mockMvc.perform(get("/api/v1/orders/" + publicOrderNumber + "/tracking")
                .param("token", "invalid-fake-token"))
            .andExpect(status().isUnauthorized());

        // 8. Upload Payment Proof
        MockMultipartFile proofFile = new MockMultipartFile(
            "file",
            "receipt.jpg",
            "image/jpeg",
            "fake-image-binary-data".getBytes()
        );

        mockMvc.perform(multipart("/api/v1/orders/" + publicOrderNumber + "/manual-payment-proofs")
                .file(proofFile)
                .param("token", trackingToken)
                .param("senderPhone", "01012345678")
                .param("senderName", "أحمد محمود")
                .param("transactionRef", "IPAY-88776655"))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.originalFilename").value("receipt.jpg"));

        // 9. Verify that Payment is now PENDING_VERIFICATION and Order is still PENDING (independent statuses)
        mockMvc.perform(get("/api/v1/orders/" + publicOrderNumber + "/tracking")
                .param("token", trackingToken))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.orderStatus").value("PENDING"))
            .andExpect(jsonPath("$.data.paymentStatus").value("PENDING_VERIFICATION"));

        // 10. Admin lists payments
        MvcResult adminPaymentsResult = mockMvc.perform(get("/api/v1/admin/payments")
                .param("status", "PENDING_VERIFICATION"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data", not(empty())))
            .andReturn();

        JsonNode paymentsList = objectMapper.readTree(adminPaymentsResult.getResponse().getContentAsString()).path("data");
        String paymentIdStr = null;
        for (JsonNode p : paymentsList) {
            if (p.path("orderId").asText().equals(orderId.toString())) {
                paymentIdStr = p.path("id").asText();
                break;
            }
        }
        assertNotNull(paymentIdStr, "Payment record for order should be found in admin payments");
        UUID paymentId = UUID.fromString(paymentIdStr);

        // 11. Admin Approves Payment -> Payment becomes PAID, Order auto-confirms to CONFIRMED
        mockMvc.perform(post("/api/v1/admin/payments/" + paymentId + "/approve")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new PaymentReviewRequest("تمت المطابقة مع كشف إنستاباي"))))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.status").value("PAID"));

        // 12. Verify Order is now CONFIRMED and PAID
        mockMvc.perform(get("/api/v1/orders/" + publicOrderNumber + "/tracking")
                .param("token", trackingToken))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.orderStatus").value("CONFIRMED"))
            .andExpect(jsonPath("$.data.paymentStatus").value("PAID"));
    }
}
