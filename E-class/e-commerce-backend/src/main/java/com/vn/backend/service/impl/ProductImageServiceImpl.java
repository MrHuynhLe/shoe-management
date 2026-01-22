package com.vn.backend.service.impl;

import com.vn.backend.entity.ProductImage;
import com.vn.backend.repository.ProductImageRepository;
import com.vn.backend.service.ProductImageService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductImageServiceImpl implements ProductImageService {

    private final ProductImageRepository productImageRepository;

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
}
