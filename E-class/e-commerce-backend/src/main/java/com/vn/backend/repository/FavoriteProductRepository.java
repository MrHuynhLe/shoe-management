package com.vn.backend.repository;

import com.vn.backend.dto.response.ProductListResponse;
import com.vn.backend.entity.FavoriteProduct;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FavoriteProductRepository extends JpaRepository<FavoriteProduct, Long> {

    boolean existsByCustomerIdAndProductId(Long customerId, Long productId);

    Optional<FavoriteProduct> findByCustomerIdAndProductId(Long customerId, Long productId);

    @Query(
            value = """
                    SELECT new com.vn.backend.dto.response.ProductListResponse(
                        p.id,
                        p.code,
                        p.name,
                        b.name,
                        c.name,
                        o.name,
                        MIN(v.sellingPrice),
                        MAX(v.sellingPrice),
                        COALESCE(SUM(v.stockQuantity), 0),
                        MAX(img.imageUrl),
                        p.isActive,
                        p.deletedAt
                    )
                    FROM FavoriteProduct fp
                    JOIN fp.product p
                    LEFT JOIN p.origin o
                    LEFT JOIN p.brand b
                    LEFT JOIN p.category c
                    LEFT JOIN p.variants v ON (v.isActive = true AND v.deletedAt IS NULL)
                    LEFT JOIN ProductImage img ON (img.product.id = p.id AND img.isPrimary = true)
                    WHERE fp.customer.id = :customerId
                      AND p.isActive = true
                      AND p.deletedAt IS NULL
                      AND (:categoryId IS NULL OR c.id = :categoryId)
                    GROUP BY
                        p.id, p.code, p.name, b.name, c.name, o.name, p.isActive, p.deletedAt, fp.createdAt
                    ORDER BY fp.createdAt DESC
                    """,
            countQuery = """
                    SELECT COUNT(fp.id)
                    FROM FavoriteProduct fp
                    JOIN fp.product p
                    LEFT JOIN p.category c
                    WHERE fp.customer.id = :customerId
                      AND p.isActive = true
                      AND p.deletedAt IS NULL
                      AND (:categoryId IS NULL OR c.id = :categoryId)
                    """
    )
    Page<ProductListResponse> findFavoriteProductList(
            @Param("customerId") Long customerId,
            @Param("categoryId") Long categoryId,
            Pageable pageable
    );
//    Page<FavoriteProduct> findAllByCustomerIdOrderByCreatedAtDesc(Long customerId, Pageable pageable);

    void deleteByCustomerIdAndProductId(Long customerId, Long productId);
}