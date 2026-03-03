package com.vn.backend.repository;

import com.vn.backend.dto.response.ProductListResponse;
import com.vn.backend.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    @Query("SELECT p FROM Product p WHERE p.deletedAt IS NULL ORDER BY p.id DESC")
    Page<Product> findAllActive(Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.deletedAt IS NULL AND p.isActive = true ORDER BY p.name ASC")
    List<Product> findAllActive();

    @Query("SELECT p FROM Product p WHERE p.id = :id AND p.deletedAt IS NULL")
    Optional<Product> findByIdActive(Long id);

    @Query("SELECT p FROM Product p WHERE (p.name LIKE %:keyword% OR p.code LIKE %:keyword%) AND p.deletedAt IS NULL")
    Page<Product> searchByKeyword(String keyword, Pageable pageable);

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
            MAX(img.imageUrl)
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
            c.name
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
