package com.lolocupcakes.cart;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.lolocupcakes.cart.dto.AddToCartRequest;
import com.lolocupcakes.cart.dto.CheckoutQuoteRequest;
import com.lolocupcakes.fulfillment.model.DeliveryZone;
import com.lolocupcakes.fulfillment.repository.DeliveryZoneRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class CartControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private DeliveryZoneRepository deliveryZoneRepository;

    @Test
    void testCompleteCartAndAuthoritativePricingFlow() throws Exception {
        // 1. Create a new guest cart
        MvcResult cartResult = mockMvc.perform(post("/api/v1/carts")
                .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.cartToken").isNotEmpty())
            .andReturn();

        String cartToken = objectMapper.readTree(cartResult.getResponse().getContentAsString())
            .path("data").path("cartToken").asText();

        // 2. Add product (Vanilla Cupcake, basePrice = 45.00)
        UUID cupcakeId = UUID.fromString("f0000001-0000-0000-0000-000000000001");
        AddToCartRequest addCupcake = new AddToCartRequest(cupcakeId, null, 2, List.of(), List.of(), "Sample Note");

        mockMvc.perform(post("/api/v1/carts/" + cartToken + "/items")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(addCupcake)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.items", hasSize(1)))
            .andExpect(jsonPath("$.data.items[0].unitPrice").value(45.00))
            .andExpect(jsonPath("$.data.items[0].lineTotal").value(90.00))
            .andExpect(jsonPath("$.data.subtotal").value(90.00));

        // 3. Add customized cake (Cake, basePrice = 450.00 + Size Medium +120 + Chocolate +40 + Candle +25)
        UUID cakeId = UUID.fromString("f0000001-0000-0000-0000-000000000002");
        UUID sizeMedium = UUID.fromString("d0000002-0000-0000-0000-000000000002"); // +120.00
        UUID chocolateFilling = UUID.fromString("d0000002-0000-0000-0000-000000000005"); // +40.00
        UUID candle = UUID.fromString("e0000001-0000-0000-0000-000000000001"); // +25.00

        AddToCartRequest addCake = new AddToCartRequest(
            cakeId, null, 1,
            List.of(sizeMedium, chocolateFilling),
            List.of(candle),
            "Custom message on cake test"
        );

        // Expected cake unit price = 450 + 120 + 40 + 25 = 635.00
        // Expected total subtotal = 90.00 + 635.00 = 725.00
        mockMvc.perform(post("/api/v1/carts/" + cartToken + "/items")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(addCake)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.items", hasSize(2)))
            .andExpect(jsonPath("$.data.subtotal").value(725.00));

        // 4. Test Authoritative Checkout Quote for Pickup (delivery fee = 0)
        CheckoutQuoteRequest pickupQuoteReq = new CheckoutQuoteRequest(cartToken, "PICKUP", null, null);

        mockMvc.perform(post("/api/v1/checkout/quote")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(pickupQuoteReq)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.subtotal").value(725.00))
            .andExpect(jsonPath("$.data.deliveryFee").value(0.00))
            .andExpect(jsonPath("$.data.totalAmount").value(725.00));

        // 5. Test Authoritative Checkout Quote for Delivery
        DeliveryZone zone = deliveryZoneRepository.findAll().get(0);
        CheckoutQuoteRequest deliveryQuoteReq = new CheckoutQuoteRequest(cartToken, "DELIVERY", zone.getId(), null);

        BigDecimal expectedTotal = BigDecimal.valueOf(725.00).add(zone.getDeliveryFee());

        mockMvc.perform(post("/api/v1/checkout/quote")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(deliveryQuoteReq)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.subtotal").value(725.00))
            .andExpect(jsonPath("$.data.deliveryFee").value(zone.getDeliveryFee().doubleValue()))
            .andExpect(jsonPath("$.data.totalAmount").value(expectedTotal.doubleValue()));
    }
}
