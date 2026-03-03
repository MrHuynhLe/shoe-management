package com.vn.backend.repository;

import com.vn.backend.entity.ProductImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface ProductImageRepository extends JpaRepository<ProductImage, Long> {

    List<ProductImage> findByProductIdOrderByDisplayOrderAsc(Long productId);

    List<ProductImage> findByProductVariantIdOrderByDisplayOrderAsc(Long variantId);

    List<ProductImage> findByProductIdAndIsPrimaryTrue(Long productId);


    //Logic: Chỉ cho phép Duy nhất 1 ảnh được làm is_primary. Nếu chọn cái mới, cái cũ phải tự về false.
    // ===== GET =====
    List<ProductImage> findByProductId(Long productId);

    List<ProductImage> findByProductVariantId(Long variantId);

    // ===== RESET PRIMARY =====

    // reset primary ảnh CHUNG của product

    @Modifying
    @Transactional
    @Query("""
        UPDATE ProductImage pi
        SET pi.isPrimary = false
        WHERE pi.product.id = :productId
    """)
    void resetPrimaryProductImage(@Param("productId") Long productId);


    @Modifying
    @Transactional
    @Query("""
        UPDATE ProductImage pi
        SET pi.isPrimary = false
        WHERE pi.productVariant.id = :variantId
    """)
    void resetPrimaryVariantImage(@Param("variantId") Long variantId);
}
