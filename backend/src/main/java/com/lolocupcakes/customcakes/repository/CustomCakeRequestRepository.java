package com.lolocupcakes.customcakes.repository;

import com.lolocupcakes.customcakes.model.CustomCakeRequest;
import com.lolocupcakes.customcakes.model.CustomCakeStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface CustomCakeRequestRepository extends JpaRepository<CustomCakeRequest, UUID> {
    Optional<CustomCakeRequest> findByPublicReference(String publicReference);
    Optional<CustomCakeRequest> findByAccessToken(String accessToken);
    Page<CustomCakeRequest> findAllByOrderByCreatedAtDesc(Pageable pageable);
    Page<CustomCakeRequest> findByStatusOrderByCreatedAtDesc(CustomCakeStatus status, Pageable pageable);
    long countByStatus(CustomCakeStatus status);
}
