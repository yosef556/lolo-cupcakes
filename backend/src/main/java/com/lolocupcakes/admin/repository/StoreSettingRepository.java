package com.lolocupcakes.admin.repository;

import com.lolocupcakes.admin.model.StoreSetting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface StoreSettingRepository extends JpaRepository<StoreSetting, UUID> {
    Optional<StoreSetting> findBySettingKey(String settingKey);
}
