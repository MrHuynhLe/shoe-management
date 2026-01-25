package com.vn.backend.repository;

import com.vn.backend.entity.ShippingProvider;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ShippingProviderRepository extends JpaRepository<ShippingProvider, Long> {

    @Query("SELECT s FROM ShippingProvider s WHERE s.isActive = true")
    Page<ShippingProvider> findAllActive(Pageable pageable);

    @Query("SELECT s FROM ShippingProvider s WHERE s.isActive = true")
    List<ShippingProvider> findAllActive();

    Optional<ShippingProvider> findByCode(String code);
}