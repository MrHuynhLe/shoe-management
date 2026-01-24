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

    @Query(
            value = """
SELECT new com.vn.backend.dto.response.ProductListResponse(
    p.id,
    p.code,
    p.name,
    b.name,
    o.name,
    c.name,
    MIN(v.sellingPrice),
    MAX(v.sellingPrice),
    SUM(v.stockQuantity),
    MAX(img.imageUrl),
    p.isActive,
    p.deletedAt
)
FROM Product p
LEFT JOIN p.origin o
LEFT JOIN p.brand b
LEFT JOIN p.category c
LEFT JOIN p.variants v ON (v.isActive = true AND v.deletedAt IS NULL)
LEFT JOIN ProductImage img ON (img.product.id = p.id AND img.isPrimary = true)
WHERE p.isActive = true
  AND p.deletedAt IS NULL
GROUP BY
    p.id, p.code, p.name, b.name, o.name, c.name, p.isActive, p.deletedAt
ORDER BY p.id DESC
""",
            countQuery = """
SELECT COUNT(p.id)
FROM Product p
WHERE p.isActive = true
  AND p.deletedAt IS NULL
"""
    )
    Page<ProductListResponse> findProductList(Pageable pageable);

    @Query("""
    SELECT DISTINCT p
    FROM Product p
    JOIN FETCH p.brand
    JOIN FETCH p.category
    JOIN FETCH p.origin
    LEFT JOIN FETCH p.variants v
    WHERE p.id = :id
      AND p.isActive = true
      AND p.deletedAt IS NULL
""")
    Optional<Product> findActiveDetailById(@Param("id") Long id);

    boolean existsByCodeAndDeletedAtIsNull(String code);

    Optional<Product> findByIdAndDeletedAtIsNull(Long id);

}
