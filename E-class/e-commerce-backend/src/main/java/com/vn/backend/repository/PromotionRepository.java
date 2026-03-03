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

    // Tất cả (có phân trang)
    Page<Promotion> findAll(Pageable pageable);

    // Danh sách đang active
    @Query("SELECT p FROM Promotion p WHERE p.isActive = true")
    List<Promotion> findAllActive();

    Optional<Promotion> findByCode(String code);

    @Query("SELECT p FROM Promotion p WHERE p.code LIKE %:keyword% OR p.name LIKE %:keyword%")
    List<Promotion> searchByKeyword(String keyword);

    // Đang có hiệu lực theo ngày.
    @Query("SELECT p FROM Promotion p WHERE p.isActive = true " +
           "AND p.startDate <= :now AND p.endDate >= :now")
    List<Promotion> findCurrentlyValid(LocalDateTime now);
}
