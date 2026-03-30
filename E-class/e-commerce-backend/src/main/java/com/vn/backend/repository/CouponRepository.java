package com.vn.backend.repository;

import com.vn.backend.entity.Coupon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

import java.util.Optional;



import com.vn.backend.entity.Coupon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CouponRepository extends JpaRepository<Coupon, Long> {

    Optional<Coupon> findByCodeAndIsActiveTrue(String code);

    @Query("""
        SELECT c
        FROM Coupon c
        WHERE c.isActive = true
          AND (
                c.usageLimit IS NULL
                OR c.usageLimit > (
                    SELECT COUNT(cu)
                    FROM CouponUsage cu
                    WHERE cu.coupon.id = c.id
                      AND cu.customer.id = :customerId
                )
          )
    """)
    List<Coupon> findUnusedCouponsForCustomer(@Param("customerId") Long customerId);
}