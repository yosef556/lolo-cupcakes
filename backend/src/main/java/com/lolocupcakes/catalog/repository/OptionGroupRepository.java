package com.lolocupcakes.catalog.repository;

import com.lolocupcakes.catalog.model.OptionGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface OptionGroupRepository extends JpaRepository<OptionGroup, UUID> {
}
