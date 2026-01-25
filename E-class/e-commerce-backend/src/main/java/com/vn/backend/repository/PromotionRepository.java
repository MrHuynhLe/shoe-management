package com.vn.backend.repository;

import com.vn.backend.entity.Promotion;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PromotionRepository extends JpaRepository<Promotion, Long> {

    @Query("SELECT p FROM Promotion p WHERE p.deletedAt IS NULL")
    Page<Promotion> findAllActive(Pageable pageable);

    @Query("SELECT p FROM Promotion p WHERE p.deletedAt IS NULL")
    List<Promotion> findAllActive();

    @Query("SELECT p FROM Promotion p WHERE p.id = :id AND p.deletedAt IS NULL")
    Optional<Promotion> findByIdActive(Long id);

    @Query("SELECT p FROM Promotion p WHERE p.code = :code AND p.deletedAt IS NULL")
    Optional<Promotion> findByCode(String code);

    @Query("SELECT p FROM Promotion p WHERE p.isActive = true AND p.deletedAt IS NULL " +
            "AND p.startDate <= :now AND p.endDate >= :now")
    List<Promotion> findActivePromotions(LocalDateTime now);
}