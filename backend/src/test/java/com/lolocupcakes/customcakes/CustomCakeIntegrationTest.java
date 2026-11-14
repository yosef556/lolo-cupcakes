package com.lolocupcakes.customcakes;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.lolocupcakes.customcakes.dto.CreateCustomCakeRequestDto;
import com.lolocupcakes.customcakes.dto.SubmitQuoteRequestDto;
import com.lolocupcakes.customcakes.model.CustomCakeQuote;
import com.lolocupcakes.customcakes.model.CustomCakeRequest;
import com.lolocupcakes.customcakes.repository.CustomCakeQuoteRepository;
import com.lolocupcakes.customcakes.repository.CustomCakeRequestRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class CustomCakeIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private CustomCakeRequestRepository requestRepository;

    @Autowired
    private CustomCakeQuoteRepository quoteRepository;

    @Test
    void testCompleteCustomCakeRequestAndQuotationWorkflow() throws Exception {
        // 1. Submit Request with reference image
        CreateCustomCakeRequestDto dto = new CreateCustomCakeRequestDto(
            "سارة أحمد",
            "01098765432",
            "sara@example.com",
            LocalDate.now().plusDays(10),
            20,
            "ريد فيلفيت مع كريمة الجبن الفاخرة",
            "كل عام وأنتِ بخير يا ليلى",
            "يرجى وضع ورود سكرية بلون وردي فاتح"
        );

        MockMultipartFile dataPart = new MockMultipartFile(
            "data",
            "",
            "application/json",
            objectMapper.writeValueAsBytes(dto)
        );

        MockMultipartFile imagePart = new MockMultipartFile(
            "referenceImage",
            "cake_design.jpg",
            "image/jpeg",
            "fake-cake-design-binary-data".getBytes()
        );

        MvcResult createResult = mockMvc.perform(multipart("/api/v1/custom-cake-requests")
                .file(dataPart)
                .file(imagePart))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.publicReference").isNotEmpty())
            .andExpect(jsonPath("$.data.accessToken").isNotEmpty())
            .andExpect(jsonPath("$.data.status").value("SUBMITTED"))
            .andExpect(jsonPath("$.data.hasReferenceImage").value(true))
            .andReturn();

        JsonNode createdData = objectMapper.readTree(createResult.getResponse().getContentAsString()).path("data");
        String publicReference = createdData.path("publicReference").asText();
        String accessToken = createdData.path("accessToken").asText();
        UUID requestId = UUID.fromString(createdData.path("id").asText());

        // 2. Customer Tracking Lookup with valid token
        mockMvc.perform(get("/api/v1/custom-cake-requests/" + publicReference)
                .param("token", accessToken))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.customerName").value("سارة أحمد"))
            .andExpect(jsonPath("$.data.status").value("SUBMITTED"));

        // 3. Customer Tracking Lookup with invalid token -> 401
        mockMvc.perform(get("/api/v1/custom-cake-requests/" + publicReference)
                .param("token", "fake-token"))
            .andExpect(status().isUnauthorized());

        // 4. Admin views request detail
        mockMvc.perform(get("/api/v1/admin/custom-cake-requests/" + requestId))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.publicReference").value(publicReference));

        // 5. Admin submits technical Quote
        SubmitQuoteRequestDto quoteDto = new SubmitQuoteRequestDto(
            BigDecimal.valueOf(850.00),
            "تورتة ريد فيلفيت تكفي 20 فرداً مع مجسمات ورود سكرية وكتابة مخصصة. العرض ساري لمدة 48 ساعة.",
            48
        );

        MvcResult quoteResult = mockMvc.perform(post("/api/v1/admin/custom-cake-requests/" + requestId + "/quote")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(quoteDto)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.status").value("QUOTED"))
            .andExpect(jsonPath("$.data.quotes", hasSize(1)))
            .andExpect(jsonPath("$.data.quotes[0].quotedPrice").value(850.00))
            .andExpect(jsonPath("$.data.quotes[0].status").value("PENDING"))
            .andReturn();

        JsonNode quotedData = objectMapper.readTree(quoteResult.getResponse().getContentAsString()).path("data");
        String quoteId = quotedData.path("quotes").get(0).path("id").asText();
        assertNotNull(quoteId);

        // 6. Customer accepts quote
        mockMvc.perform(post("/api/v1/custom-cake-requests/" + publicReference + "/quotes/" + quoteId + "/accept")
                .param("token", accessToken))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.status").value("ACCEPTED"))
            .andExpect(jsonPath("$.data.quotes[0].status").value("ACCEPTED"));

        // 7. Customer tries to accept again -> 400 Invalid transition
        mockMvc.perform(post("/api/v1/custom-cake-requests/" + publicReference + "/quotes/" + quoteId + "/accept")
                .param("token", accessToken))
            .andExpect(status().isBadRequest());
    }

    @Test
    void testExpiredQuoteCannotBeAccepted() throws Exception {
        // Setup an expired quote directly
        CustomCakeRequest req = new CustomCakeRequest();
        req.setPublicReference("CCR-EXP-" + UUID.randomUUID().toString().substring(0, 8));
        req.setAccessToken(UUID.randomUUID().toString().replace("-", ""));
        req.setCustomerName("عميل اختبار انتهاء");
        req.setCustomerPhone("01011112222");
        req.setRequestedDate(LocalDate.now().plusDays(7));
        req.setStatus(com.lolocupcakes.customcakes.model.CustomCakeStatus.QUOTED);
        CustomCakeRequest savedReq = requestRepository.save(req);

        CustomCakeQuote quote = new CustomCakeQuote(
            savedReq,
            BigDecimal.valueOf(500.00),
            "عرض منتهي",
            Instant.now().minus(2, ChronoUnit.HOURS), // expired 2 hours ago
            UUID.fromString("a0000000-0000-0000-0000-000000000001")
        );
        CustomCakeQuote savedQuote = quoteRepository.save(quote);

        // Attempt to accept expired quote -> Expect 400 QUOTE_EXPIRED
        mockMvc.perform(post("/api/v1/custom-cake-requests/" + savedReq.getPublicReference() + "/quotes/" + savedQuote.getId() + "/accept")
                .param("token", savedReq.getAccessToken()))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.code").value("QUOTE_EXPIRED"));
    }
}
