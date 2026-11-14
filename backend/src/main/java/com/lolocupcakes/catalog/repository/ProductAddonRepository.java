package com.lolocupcakes.catalog.repository;

import com.lolocupcakes.catalog.model.ProductAddon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ProductAddonRepository extends JpaRepository<ProductAddon, UUID> {
    List<ProductAddon> findByIsActiveTrueOrderByDisplayOrderAsc();
}
