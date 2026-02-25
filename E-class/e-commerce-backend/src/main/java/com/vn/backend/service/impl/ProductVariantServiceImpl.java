package com.vn.backend.service.impl;
import com.vn.backend.dto.request.ProductVariantRequest;
import com.vn.backend.entity.Product;
import com.vn.backend.entity.ProductVariant;
import com.vn.backend.repository.ProductRepository;
import com.vn.backend.repository.ProductVariantRepository;
import com.vn.backend.service.ProductVariantService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ProductVariantServiceImpl {

    private final ProductVariantRepository productVariantRepository;
    private final ProductRepository productRepository;

    public void createVariants(ProductVariantRequest request) {

        // 1. Lấy product từ DB
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found"));

        // 2. Duyệt từng variant
        for (ProductVariantRequest.VariantItem item : request.getVariants()) {

            ProductVariant variant = new ProductVariant();

            variant.setProduct(product);
            variant.setColor(item.getColor());
            variant.setSize(item.getSize());
            variant.setCostPrice(item.getCostPrice());
            variant.setSellingPrice(item.getSellingPrice());
            variant.setStockQuantity(item.getStockQuantity());
            variant.setImageUrl(item.getImageUrl());

            // 3. LƯU DB
            productVariantRepository.save(variant);
        }
    }
}



