package com.vn.backend.repository;

import com.vn.backend.dto.response.ProductListResponse;
import com.vn.backend.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {

    boolean existsByCodeAndDeletedAtIsNull(String code);

    boolean existsByCodeAndDeletedAtIsNullAndIdNot(String code, Long id);

    Optional<Product> findByIdAndDeletedAtIsNull(Long id);

    @Query("""
            select p
            from Product p
            left join fetch p.brand
            left join fetch p.category
            left join fetch p.origin
            left join fetch p.supplier
            left join fetch p.images
            where p.id = :id
              and p.deletedAt is null
              and (:includeInactive = true or p.isActive = true)
            """)
    Optional<Product> findDetailById(
            @Param("id") Long id,
            @Param("includeInactive") boolean includeInactive
    );

    @Query(
            value = """
                    select new com.vn.backend.dto.response.ProductListResponse(
                        p.id,
                        p.code,
                        p.name,
                        b.name,
                        (
                            select min(pi.imageUrl)
                            from ProductImage pi
                            where pi.product = p
                        ),
                        coalesce(sum(v.stockQuantity), 0),
                        min(v.sellingPrice),
                        max(v.sellingPrice),
                        min(v.costPrice),
                        max(v.costPrice),
                        p.isActive
                    )
                    from Product p
                    left join p.brand b
                    left join p.category c
                    left join p.variants v
                        on v.deletedAt is null
                        and (:includeInactive = true or v.isActive = true)
                    where p.deletedAt is null
                      and (:includeInactive = true or p.isActive = true)
                      and (:categoryId is null or c.id = :categoryId)
                      and (:brandId is null or b.id = :brandId)
                    group by p.id, p.code, p.name, b.name, p.isActive
                    order by p.id desc
                    """,
            countQuery = """
                    select count(p.id)
                    from Product p
                    left join p.category c
                    left join p.brand b
                    where p.deletedAt is null
                      and (:includeInactive = true or p.isActive = true)
                      and (:categoryId is null or c.id = :categoryId)
                      and (:brandId is null or b.id = :brandId)
                    """
    )
    Page<ProductListResponse> findProductList(
            Pageable pageable,
            @Param("categoryId") Long categoryId,
            @Param("brandId") Long brandId,
            @Param("includeInactive") boolean includeInactive
    );

    @Query(
            value = """
                    select distinct p
                    from Product p
                    left join p.brand b
                    left join p.category c
                    where p.deletedAt is null
                      and p.isActive = true
                      and (:keywordPattern is null or lower(p.name) like :keywordPattern or lower(p.code) like :keywordPattern)
                      and (:categoryId is null or c.id = :categoryId)
                      and (:brandId is null or b.id = :brandId)
                      and exists (
                            select 1
                            from ProductVariant v
                            where v.product = p
                              and v.deletedAt is null
                              and v.isActive = true
                              and (:minPrice is null or (
                                    v.sellingPrice * (
                                        100 - coalesce((
                                            select max(activePromo.discountPercent)
                                            from PromotionVariant activePv
                                            join activePv.promotion activePromo
                                            where activePv.variant = v
                                              and activePromo.status = true
                                              and activePromo.discountPercent > 0
                                              and activePromo.startDate <= :now
                                              and activePromo.endDate >= :now
                                        ), 0)
                                    ) / 100
                              ) >= :minPrice)
                              and (:maxPrice is null or (
                                    v.sellingPrice * (
                                        100 - coalesce((
                                            select max(activePromo.discountPercent)
                                            from PromotionVariant activePv
                                            join activePv.promotion activePromo
                                            where activePv.variant = v
                                              and activePromo.status = true
                                              and activePromo.discountPercent > 0
                                              and activePromo.startDate <= :now
                                              and activePromo.endDate >= :now
                                        ), 0)
                                    ) / 100
                              ) <= :maxPrice)
                              and (:sizeFilter is null or exists (
                                    select 1 from VariantAttributeValue vav
                                    join vav.attributeValue av
                                    join av.attribute a
                                    where vav.variant = v
                                      and upper(a.code) = 'SIZE'
                                      and lower(av.value) = :sizeFilter
                              ))
                              and (:colorFilter is null or exists (
                                    select 1 from VariantAttributeValue vav
                                    join vav.attributeValue av
                                    join av.attribute a
                                    where vav.variant = v
                                      and upper(a.code) = 'COLOR'
                                      and lower(av.value) = :colorFilter
                              ))
                      )
                      and (
                            :isSale is null
                            or (
                                :isSale = true
                                and exists (
                                    select 1
                                    from PromotionVariant pv
                                    join pv.promotion promo
                                    join pv.variant saleVariant
                                    where saleVariant.product = p
                                      and saleVariant.deletedAt is null
                                      and saleVariant.isActive = true
                                      and promo.status = true
                                      and promo.discountPercent > 0
                                      and promo.startDate <= :now
                                      and promo.endDate >= :now
                                )
                            )
                            or (
                                :isSale = false
                                and not exists (
                                    select 1
                                    from PromotionVariant pv
                                    join pv.promotion promo
                                    join pv.variant saleVariant
                                    where saleVariant.product = p
                                      and saleVariant.deletedAt is null
                                      and saleVariant.isActive = true
                                      and promo.status = true
                                      and promo.discountPercent > 0
                                      and promo.startDate <= :now
                                      and promo.endDate >= :now
                                )
                            )
                      )
                    """,
            countQuery = """
                    select count(distinct p.id)
                    from Product p
                    left join p.category c
                    left join p.brand b
                    where p.deletedAt is null
                      and p.isActive = true
                      and (:keywordPattern is null or lower(p.name) like :keywordPattern or lower(p.code) like :keywordPattern)
                      and (:categoryId is null or c.id = :categoryId)
                      and (:brandId is null or b.id = :brandId)
                      and exists (
                            select 1
                            from ProductVariant v
                            where v.product = p
                              and v.deletedAt is null
                              and v.isActive = true
                              and (:minPrice is null or (
                                    v.sellingPrice * (
                                        100 - coalesce((
                                            select max(activePromo.discountPercent)
                                            from PromotionVariant activePv
                                            join activePv.promotion activePromo
                                            where activePv.variant = v
                                              and activePromo.status = true
                                              and activePromo.discountPercent > 0
                                              and activePromo.startDate <= :now
                                              and activePromo.endDate >= :now
                                        ), 0)
                                    ) / 100
                              ) >= :minPrice)
                              and (:maxPrice is null or (
                                    v.sellingPrice * (
                                        100 - coalesce((
                                            select max(activePromo.discountPercent)
                                            from PromotionVariant activePv
                                            join activePv.promotion activePromo
                                            where activePv.variant = v
                                              and activePromo.status = true
                                              and activePromo.discountPercent > 0
                                              and activePromo.startDate <= :now
                                              and activePromo.endDate >= :now
                                        ), 0)
                                    ) / 100
                              ) <= :maxPrice)
                              and (:sizeFilter is null or exists (
                                    select 1 from VariantAttributeValue vav
                                    join vav.attributeValue av
                                    join av.attribute a
                                    where vav.variant = v
                                      and upper(a.code) = 'SIZE'
                                      and lower(av.value) = :sizeFilter
                              ))
                              and (:colorFilter is null or exists (
                                    select 1 from VariantAttributeValue vav
                                    join vav.attributeValue av
                                    join av.attribute a
                                    where vav.variant = v
                                      and upper(a.code) = 'COLOR'
                                      and lower(av.value) = :colorFilter
                              ))
                      )
                      and (
                            :isSale is null
                            or (
                                :isSale = true
                                and exists (
                                    select 1
                                    from PromotionVariant pv
                                    join pv.promotion promo
                                    join pv.variant saleVariant
                                    where saleVariant.product = p
                                      and saleVariant.deletedAt is null
                                      and saleVariant.isActive = true
                                      and promo.status = true
                                      and promo.discountPercent > 0
                                      and promo.startDate <= :now
                                      and promo.endDate >= :now
                                )
                            )
                            or (
                                :isSale = false
                                and not exists (
                                    select 1
                                    from PromotionVariant pv
                                    join pv.promotion promo
                                    join pv.variant saleVariant
                                    where saleVariant.product = p
                                      and saleVariant.deletedAt is null
                                      and saleVariant.isActive = true
                                      and promo.status = true
                                      and promo.discountPercent > 0
                                      and promo.startDate <= :now
                                      and promo.endDate >= :now
                                )
                            )
                      )
                    """
    )
    Page<Product> filterProducts(
            Pageable pageable,
            @Param("keywordPattern") String keywordPattern,
            @Param("categoryId") Long categoryId,
            @Param("brandId") Long brandId,
            @Param("sizeFilter") String sizeFilter,
            @Param("colorFilter") String colorFilter,
            @Param("minPrice") BigDecimal minPrice,
            @Param("maxPrice") BigDecimal maxPrice,
            @Param("isSale") Boolean isSale,
            @Param("now") java.time.OffsetDateTime now
    );
}
