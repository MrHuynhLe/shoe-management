package com.vn.backend.repository;

import com.vn.backend.entity.PromotionVariant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.OffsetDateTime;
import java.util.Collection;
import java.util.List;

public interface PromotionVariantRepository extends JpaRepository<PromotionVariant, Long> {

    void deleteByPromotion_Id(Long promotionId);

    List<PromotionVariant> findByPromotion_Id(Long promotionId);

    @Query("""
            select pv
            from PromotionVariant pv
            join fetch pv.promotion p
            join fetch pv.variant v
            join fetch v.product product
            where p.id = :promotionId
            """)
    List<PromotionVariant> findByPromotionIdWithVariant(@Param("promotionId") Long promotionId);

    @Query("""
            select pv
            from PromotionVariant pv
            join fetch pv.promotion p
            join fetch pv.variant v
            where v.id in :variantIds
              and p.status = true
              and p.discountPercent > 0
              and p.startDate <= :now
              and p.endDate >= :now
              and (:excludePromotionId is null or p.id <> :excludePromotionId)
            """)
    List<PromotionVariant> findActiveConflicts(
            @Param("variantIds") Collection<Long> variantIds,
            @Param("now") OffsetDateTime now,
            @Param("excludePromotionId") Long excludePromotionId
    );

    @Query("""
            select pv
            from PromotionVariant pv
            join fetch pv.promotion p
            join fetch pv.variant v
            where v.id in :variantIds
              and p.status = true
              and p.discountPercent > 0
              and p.startDate <= :now
              and p.endDate >= :now
            """)
    List<PromotionVariant> findActiveByVariantIds(
            @Param("variantIds") Collection<Long> variantIds,
            @Param("now") OffsetDateTime now
    );
}
