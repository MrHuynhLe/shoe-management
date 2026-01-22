package com.vn.backend.repository;

import com.vn.backend.entity.ProductImage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductImageRepository extends JpaRepository<ProductImage, Long> {

    List<ProductImage> findByProductIdOrderByDisplayOrderAsc(Long productId);

    List<ProductImage> findByProductVariantIdOrderByDisplayOrderAsc(Long variantId);

    List<ProductImage> findByProductIdAndIsPrimaryTrue(Long productId);
}
