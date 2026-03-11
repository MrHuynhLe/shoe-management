package com.vn.backend.repository;

import com.vn.backend.entity.CouponUsage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CouponUsageRepository extends JpaRepository<CouponUsage, Long> {
    long countByCoupon_IdAndCustomer_Id(Long couponId, Long customerId);

    long countByPromotion_Id(Long promotionId);
    long countByPromotion_IdAndCustomer_Id(Long promotionId, Long customerId);

    void deleteByOrder_Id(Long orderId);
}