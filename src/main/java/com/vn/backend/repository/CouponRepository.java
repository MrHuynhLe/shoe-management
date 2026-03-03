package com.vn.backend.repository;

import com.vn.backend.entity.Coupon;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface CouponRepository extends JpaRepository<Coupon, Long> {
//repository voucher
    Page<Coupon> findAll(Pageable pageable);

    @Query("SELECT c FROM Coupon c WHERE c.isActive = true")
    List<Coupon> findAllActive();

    Optional<Coupon> findByCode(String code);

    @Query("SELECT c FROM Coupon c WHERE c.code LIKE %:keyword%")
    List<Coupon> searchByKeyword(String keyword);

    // Còn hiệu lực: active + chưa hết hạn + chưa dùng hết lượt
    @Query("SELECT c FROM Coupon c WHERE c.isActive = true " +
           "AND c.usedCount < c.usageLimit " +
           "AND (c.endDate IS NULL OR c.endDate >= :now)")
    List<Coupon> findValid(LocalDateTime now);
}
