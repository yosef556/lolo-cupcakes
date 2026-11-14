package com.lolocupcakes.admin.dto;

import com.lolocupcakes.admin.model.StoreSetting;
import java.time.Instant;

public record StoreSettingDto(
    String key,
    String value,
    String description,
    Instant updatedAt
) {
    public static StoreSettingDto fromEntity(StoreSetting setting) {
        return new StoreSettingDto(
            setting.getSettingKey(),
            setting.getSettingValue(),
            setting.getDescription(),
            setting.getUpdatedAt()
        );
    }
}
