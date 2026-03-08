package com.vn.backend.service.impl;

import com.vn.backend.dto.request.ProductImageCreateRequest;
import com.vn.backend.entity.Product;
import com.vn.backend.entity.ProductImage;
import com.vn.backend.entity.ProductVariant;
import com.vn.backend.repository.ProductImageRepository;
import com.vn.backend.repository.ProductRepository;
import com.vn.backend.repository.ProductVariantRepository;
import com.vn.backend.service.ProductImageService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductImageServiceImpl implements ProductImageService {

    private final ProductImageRepository productImageRepository;
    private final ProductRepository productRepository;
    private final ProductVariantRepository productVariantRepository;


    @Override
    public List<String> getImagesByProductId(Long productId) {
        return productImageRepository.findByProductIdOrderByDisplayOrderAsc(productId)
                .stream()
                .map(ProductImage::getImageUrl)
                .toList();
    }

    @Override
    public List<String> getImagesByVariantId(Long variantId) {
        return productImageRepository.findByProductVariantIdOrderByDisplayOrderAsc(variantId)
                .stream()
                .map(ProductImage::getImageUrl)
                .toList();
    }

    @Override
    public String getPrimaryImageByProductId(Long productId) {
        return productImageRepository.findByProductIdAndIsPrimaryTrue(productId)
                .stream()
                .findFirst()
                .map(ProductImage::getImageUrl)
                .orElse(null);
    }

    @Override
    @Transactional
    public void create(ProductImageCreateRequest request) {

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("Product không tồn tại"));

        ProductVariant variant = null;

        if (request.getProductVariantId() != null) {
            variant = productVariantRepository.findById(request.getProductVariantId())
                    .orElseThrow(() -> new RuntimeException("Variant không tồn tại"));
        }

        if (Boolean.TRUE.equals(request.getIsPrimary())) {
            if (variant != null) {
                productImageRepository.resetPrimaryVariantImage(variant.getId());
            } else {
                productImageRepository.resetPrimaryProductImage(product.getId());
            }
        }

        ProductImage image = new ProductImage();
        image.setProduct(product);
        image.setProductVariant(variant);
        image.setImageUrl(request.getImageUrl());
        image.setIsPrimary(Boolean.TRUE.equals(request.getIsPrimary()));
        image.setDisplayOrder(
                request.getDisplayOrder() != null ? request.getDisplayOrder() : 0
        );

        productImageRepository.save(image);
    }

}
