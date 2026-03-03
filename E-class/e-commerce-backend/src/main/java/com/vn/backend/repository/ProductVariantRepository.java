package com.vn.backend.repository;

import com.vn.backend.entity.ProductVariant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductVariantRepository extends JpaRepository<ProductVariant, Long> {

    List<ProductVariant> findByProductIdAndDeletedAtIsNull(Long productId);

    List<ProductVariant> findByDeletedAtIsNull();

    Optional<ProductVariant> findByCodeAndDeletedAtIsNull(String code);

    Optional<ProductVariant> findByBarcodeAndDeletedAtIsNull(String barcode);

    boolean existsByCode(String code);

    boolean existsByBarcode(String barcode);
}

