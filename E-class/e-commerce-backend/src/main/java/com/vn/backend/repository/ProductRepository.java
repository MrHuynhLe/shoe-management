package com.vn.backend.repository;

import com.vn.backend.dto.response.ProductListResponse;
import com.vn.backend.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface ProductRepository extends JpaRepository<Product, Long> {

    @Query(
            value = """
        SELECT new com.vn.backend.dto.response.ProductListResponse(
            p.id,
            p.code,
            p.name,
            b.name,
            c.name,
            MIN(v.sellingPrice),
            MAX(v.sellingPrice),
            SUM(v.stockQuantity),
            img.imageUrl
        )
        FROM Product p
        JOIN p.brand b
        JOIN p.category c
        JOIN p.variants v
        LEFT JOIN ProductImage img
        ON img.product.id = p.id
       AND img.isPrimary = true
        WHERE p.isActive = true
        GROUP BY
            p.id,
            p.code,
            p.name,
            b.name,
            c.name,
            img.imageUrl
        ORDER BY p.id DESC
        """,
            countQuery = """
        SELECT COUNT(DISTINCT p.id)
        FROM Product p
        WHERE p.isActive = true
        """
    )
    Page<ProductListResponse> findProductList(Pageable pageable);
}


