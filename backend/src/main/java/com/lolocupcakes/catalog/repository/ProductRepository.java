package com.lolocupcakes.catalog.repository;

import com.lolocupcakes.catalog.model.Product;
import com.lolocupcakes.catalog.model.ProductType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProductRepository extends JpaRepository<Product, UUID> {

    Optional<Product> findBySlug(String slug);

    Optional<Product> findBySlugAndIsActiveTrue(String slug);

    boolean existsBySlug(String slug);

    List<Product> findTop8ByIsFeaturedTrueAndIsActiveTrueOrderByDisplayOrderAsc();

    @Query("""
        SELECT p FROM Product p
        JOIN p.category c
        WHERE p.isActive = true
        AND (:categorySlug IS NULL OR c.slug = :categorySlug)
        AND (:productType IS NULL OR p.productType = :productType)
        AND (:searchPattern IS NULL OR LOWER(p.nameAr) LIKE :searchPattern OR LOWER(p.descriptionAr) LIKE :searchPattern)
    """)
    Page<Product> findPublicProducts(
        @Param("categorySlug") String categorySlug,
        @Param("productType") ProductType productType,
        @Param("searchPattern") String searchPattern,
        Pageable pageable
    );

    @Query("""
        SELECT p FROM Product p
        JOIN p.category c
        WHERE (:categorySlug IS NULL OR c.slug = :categorySlug)
        AND (:productType IS NULL OR p.productType = :productType)
        AND (:searchPattern IS NULL OR LOWER(p.nameAr) LIKE :searchPattern)
    """)
    Page<Product> findAdminProducts(
        @Param("categorySlug") String categorySlug,
        @Param("productType") ProductType productType,
        @Param("searchPattern") String searchPattern,
        Pageable pageable
    );
}
