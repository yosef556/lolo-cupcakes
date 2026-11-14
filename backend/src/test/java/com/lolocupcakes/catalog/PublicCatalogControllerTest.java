package com.lolocupcakes.catalog;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class PublicCatalogControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void shouldReturnActiveCategories() throws Exception {
        mockMvc.perform(get("/api/v1/categories")
                .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data", hasSize(greaterThanOrEqualTo(5))))
            .andExpect(jsonPath("$.data[0].slug").value("cupcakes"));
    }

    @Test
    void shouldReturnPublicProductsPage() throws Exception {
        mockMvc.perform(get("/api/v1/products")
                .param("page", "0")
                .param("size", "10")
                .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.content", hasSize(greaterThanOrEqualTo(6))))
            .andExpect(jsonPath("$.data.content[0].nameAr").isNotEmpty());
    }

    @Test
    void shouldReturnProductDetailBySlug() throws Exception {
        mockMvc.perform(get("/api/v1/products/chocolate-delight-cake")
                .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.slug").value("chocolate-delight-cake"))
            .andExpect(jsonPath("$.data.basePrice").value(450.00))
            .andExpect(jsonPath("$.data.optionGroups", hasSize(greaterThanOrEqualTo(2))))
            .andExpect(jsonPath("$.data.addons", hasSize(greaterThanOrEqualTo(2))));
    }

    @Test
    void shouldReturnAvailableOptions() throws Exception {
        mockMvc.perform(get("/api/v1/products/chocolate-delight-cake/available-options")
                .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.optionGroups", hasSize(greaterThanOrEqualTo(1))));
    }

    @Test
    void shouldReturnStorefrontHomeData() throws Exception {
        mockMvc.perform(get("/api/v1/storefront/home")
                .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.categories").isArray())
            .andExpect(jsonPath("$.data.featuredProducts").isArray());
    }
}
