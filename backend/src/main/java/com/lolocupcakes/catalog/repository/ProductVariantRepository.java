package com.lolocupcakes.catalog.repository;

import com.lolocupcakes.catalog.model.ProductVariant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ProductVariantRepository extends JpaRepository<ProductVariant, UUID> {
    List<ProductVariant> findByProductIdAndIsActiveTrueOrderByDisplayOrderAsc(UUID productId);
    List<ProductVariant> findByProductIdOrderByDisplayOrderAsc(UUID productId);
}
