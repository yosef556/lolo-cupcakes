package com.lolocupcakes.customcakes.repository;

import com.lolocupcakes.customcakes.model.CustomCakeQuote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CustomCakeQuoteRepository extends JpaRepository<CustomCakeQuote, UUID> {
    List<CustomCakeQuote> findByRequestIdOrderByCreatedAtDesc(UUID requestId);
}
