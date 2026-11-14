package com.lolocupcakes.catalog.repository;

import com.lolocupcakes.catalog.model.OptionValue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface OptionValueRepository extends JpaRepository<OptionValue, UUID> {
}
