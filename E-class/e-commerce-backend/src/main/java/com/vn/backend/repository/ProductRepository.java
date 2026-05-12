package com.vn.backend.repository;

import com.vn.backend.dto.response.ProductListResponse;
import com.vn.backend.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

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
}
