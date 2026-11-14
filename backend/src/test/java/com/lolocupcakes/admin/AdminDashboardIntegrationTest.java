package com.lolocupcakes.admin;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Map;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class AdminDashboardIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void testPublicSettingsEndpoint() throws Exception {
        mockMvc.perform(get("/api/v1/settings"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.currency").value("EGP"))
            .andExpect(jsonPath("$.data.business_timezone").value("Africa/Cairo"));
    }

    @Test
    void testAdminDashboardMetricsEndpoint() throws Exception {
        mockMvc.perform(get("/api/v1/admin/dashboard/metrics"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.totalOrdersCount", greaterThanOrEqualTo(0)))
            .andExpect(jsonPath("$.data.recentOrders").isArray());
    }

    @Test
    void testAdminSettingsUpdateFlow() throws Exception {
        mockMvc.perform(put("/api/v1/admin/settings/contact_phone")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("value", "01099998888"))))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.key").value("contact_phone"))
            .andExpect(jsonPath("$.data.value").value("01099998888"));

        // Verify update reflected in public settings
        mockMvc.perform(get("/api/v1/settings"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.contact_phone").value("01099998888"));
    }
}
