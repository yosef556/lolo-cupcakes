package com.lolocupcakes.admin.service;

import com.lolocupcakes.admin.dto.StoreSettingDto;
import com.lolocupcakes.admin.model.StoreSetting;
import com.lolocupcakes.admin.repository.StoreSettingRepository;
import com.lolocupcakes.common.BusinessException;
import com.lolocupcakes.common.ErrorCode;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Transactional
public class StoreSettingService {

    private final StoreSettingRepository settingRepository;
    private final com.lolocupcakes.scheduling.repository.BranchRepository branchRepository;

    public StoreSettingService(
        StoreSettingRepository settingRepository,
        com.lolocupcakes.scheduling.repository.BranchRepository branchRepository
    ) {
        this.settingRepository = settingRepository;
        this.branchRepository = branchRepository;
    }

    @Transactional(readOnly = true)
    public Map<String, String> getPublicSettings() {
        return settingRepository.findAll().stream()
            .collect(Collectors.toMap(StoreSetting::getSettingKey, StoreSetting::getSettingValue, (a, b) -> b));
    }

    @Transactional(readOnly = true)
    public List<StoreSettingDto> getAllSettings() {
        return settingRepository.findAll().stream()
            .map(StoreSettingDto::fromEntity)
            .toList();
    }

    public StoreSettingDto updateSetting(String key, String value) {
        StoreSetting setting = settingRepository.findBySettingKey(key)
            .orElseGet(() -> new StoreSetting(key, value, "إعداد متجر مخصص"));

        setting.setSettingValue(value);
        StoreSetting saved = settingRepository.save(setting);

        // Keep active branch in sync with store contact info
        if ("store_phone".equals(key) || "contact_phone".equals(key)) {
            branchRepository.findAll().stream().filter(com.lolocupcakes.scheduling.model.Branch::getIsActive).findFirst().ifPresent(b -> {
                b.setPhone(value);
                branchRepository.save(b);
            });
        } else if ("store_address_ar".equals(key)) {
            branchRepository.findAll().stream().filter(com.lolocupcakes.scheduling.model.Branch::getIsActive).findFirst().ifPresent(b -> {
                b.setAddressAr(value);
                branchRepository.save(b);
            });
        }

        return StoreSettingDto.fromEntity(saved);
    }
}
