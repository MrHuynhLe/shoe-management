package com.vn.backend.repository;
import com.vn.backend.entity.Coupon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import org.springframework.data.repository.query.Param;

@Repository
public interface CouponRepository extends JpaRepository<Coupon, Long> {

    Optional<Coupon> findByCodeAndIsActiveTrue(String code);

    boolean existsByCode(String code);

    boolean existsByCodeAndIdNot(String code, Long id);

    @Query("""
        SELECT c
        FROM Coupon c
        WHERE c.isActive = true
          AND (
                c.usageLimit IS NULL
                OR (
                    SELECT COUNT(cu)
                    FROM CouponUsage cu
                    WHERE cu.coupon.id = c.id
                ) < c.usageLimit
          )
          AND NOT EXISTS (
                SELECT cu
                FROM CouponUsage cu
                WHERE cu.coupon.id = c.id
                  AND cu.customer.id = :customerId
          )
        ORDER BY c.createdAt DESC
    """)
    List<Coupon> findAvailableCouponsForCustomer(@Param("customerId") Long customerId);

}