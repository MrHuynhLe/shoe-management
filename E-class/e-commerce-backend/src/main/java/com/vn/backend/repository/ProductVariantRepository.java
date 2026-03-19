package com.vn.backend.repository;

import com.vn.backend.entity.ProductVariant;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductVariantRepository extends JpaRepository<ProductVariant, Long> {

    @Query("""
        SELECT DISTINCT pv
        FROM ProductVariant pv
        LEFT JOIN FETCH pv.variantAttributeValues vav
        LEFT JOIN FETCH vav.attributeValue av
        LEFT JOIN FETCH av.attribute
        WHERE pv.deletedAt IS NULL
    """)
    List<ProductVariant> findAllActiveWithAttributes();

    @Query("""
        SELECT DISTINCT pv
        FROM ProductVariant pv
        LEFT JOIN FETCH pv.variantAttributeValues vav
        LEFT JOIN FETCH vav.attributeValue av
        LEFT JOIN FETCH av.attribute
        WHERE pv.deletedAt IS NULL
          AND pv.product.id = :productId
    """)
    List<ProductVariant> findByProductIdWithAttributes(@Param("productId") Long productId);

    @Query("""
        SELECT DISTINCT pv
        FROM ProductVariant pv
        LEFT JOIN FETCH pv.variantAttributeValues vav
        LEFT JOIN FETCH vav.attributeValue av
        LEFT JOIN FETCH av.attribute
        WHERE pv.deletedAt IS NULL
          AND pv.id = :id
    """)
    Optional<ProductVariant> findActiveById(@Param("id") Long id);

    boolean existsByCodeAndDeletedAtIsNull(String code);

    boolean existsByBarcodeAndDeletedAtIsNull(String barcode);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select v from ProductVariant v where v.id = :id and v.deletedAt is null")
    Optional<ProductVariant> findByIdForUpdate(@Param("id") Long id);

}