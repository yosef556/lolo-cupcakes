package com.lolocupcakes.catalog.dto;

import com.lolocupcakes.catalog.model.OptionGroup;
import com.lolocupcakes.catalog.model.SelectionType;

import java.util.List;
import java.util.UUID;

public record OptionGroupDto(
    UUID id,
    String nameAr,
    String nameEn,
    SelectionType selectionType,
    Boolean isRequired,
    Integer minSelections,
    Integer maxSelections,
    List<OptionValueDto> values
) {
    public static OptionGroupDto fromEntity(OptionGroup group) {
        List<OptionValueDto> valueDtos = group.getValues().stream()
            .filter(v -> Boolean.TRUE.equals(v.getIsActive()))
            .map(OptionValueDto::fromEntity)
            .toList();

        return new OptionGroupDto(
            group.getId(),
            group.getNameAr(),
            group.getNameEn(),
            group.getSelectionType(),
            group.getIsRequired(),
            group.getMinSelections(),
            group.getMaxSelections(),
            valueDtos
        );
    }
}
