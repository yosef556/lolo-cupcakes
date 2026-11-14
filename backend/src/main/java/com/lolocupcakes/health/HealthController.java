package com.lolocupcakes.health;

import com.lolocupcakes.common.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.ZonedDateTime;
import java.time.ZoneId;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/health")
@Tag(name = "Health", description = "فحص سلامة النظام والاتصال بقاعدة البيانات")
public class HealthController {

    private final JdbcTemplate jdbcTemplate;

    public HealthController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @GetMapping
    @Operation(summary = "فحص حالة الخادم وقاعدة البيانات")
    public ApiResponse<Map<String, Object>> checkHealth() {
        boolean dbHealthy = false;
        try {
            Integer result = jdbcTemplate.queryForObject("SELECT 1", Integer.class);
            dbHealthy = (result != null && result == 1);
        } catch (Exception ignored) {
        }

        ZoneId cairoZone = ZoneId.of("Africa/Cairo");
        ZonedDateTime cairoTime = ZonedDateTime.now(cairoZone);

        Map<String, Object> status = Map.of(
            "status", dbHealthy ? "UP" : "DEGRADED",
            "service", "lolo-cupcakes-backend",
            "database", dbHealthy ? "CONNECTED" : "DISCONNECTED",
            "businessTimezone", cairoZone.getId(),
            "businessTimeCairo", cairoTime.toString()
        );

        return ApiResponse.ok("Lolo Cupcakes API is running", status);
    }
}
