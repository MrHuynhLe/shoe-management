package com.vn.backend.repository;

import com.vn.backend.entity.Promotion;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PromotionRepository extends JpaRepository<Promotion, Long> {

    @Query("SELECT p FROM Promotion p WHERE p.code = :code AND p.isActive = true")
    Optional<Promotion> findByCode(String code);

    @Query("""
        SELECT p FROM Promotion p WHERE p.isActive = true
        AND (p.startDate IS NULL OR p.startDate <= :now)
        AND (p.endDate IS NULL OR p.endDate >= :now)
    """)
    Page<Promotion> findActivePromotions(OffsetDateTime now, Pageable pageable);

    @Query("""
    SELECT p FROM Promotion p
    WHERE p.isActive = true
    AND (p.startDate IS NULL OR p.startDate <= :now)
    AND (p.endDate IS NULL OR p.endDate >= :now)
""")
    List<Promotion> findAllAvailableForPos(OffsetDateTime now);
}