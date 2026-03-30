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
            select pv
            from ProductVariant pv
            join pv.product p
            where pv.isActive = true
              and p.isActive = true
              and (
                    lower(p.name) like lower(concat('%', :keyword, '%'))
                 or lower(p.code) like lower(concat('%', :keyword, '%'))
                 or lower(pv.code) like lower(concat('%', :keyword, '%'))
                 or lower(pv.barcode) like lower(concat('%', :keyword, '%'))
              )
            order by p.name asc
            """)
    List<ProductVariant> searchForPos(String keyword);

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

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select pv from ProductVariant pv where pv.id = :id")
    Optional<ProductVariant> findByIdForUpdate(Long id);

    Optional<ProductVariant> findByBarcode(String barcode);

    boolean existsByCodeAndDeletedAtIsNull(String code);

    boolean existsByBarcodeAndDeletedAtIsNull(String barcode);

    List<ProductVariant> findByProductId(Long productId);
}