package com.vn.backend.service.impl;


import com.vn.backend.dto.request.ProductVariantCreateRequest;
import com.vn.backend.dto.response.ProductVariantResponse;
import com.vn.backend.entity.AttributeValue;
import com.vn.backend.entity.Product;
import com.vn.backend.entity.ProductVariant;
import com.vn.backend.entity.VariantAttributeValue;
import com.vn.backend.repository.AttributeValueRepository;
import com.vn.backend.repository.ProductRepository;
import com.vn.backend.repository.ProductVariantRepository;
import com.vn.backend.repository.VariantAttributeValueRepository;
import com.vn.backend.service.ProductVariantService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor

public class ProductVariantServiceImpl implements ProductVariantService {

    private final ProductVariantRepository variantRepository;
    private final ProductRepository productRepository;
    private final AttributeValueRepository attributeValueRepository;
    private final ProductImageRepository productImageRepository;

    @Override
    @Transactional
    public void createBulkVariants(VariantBulkRequest request) {

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Sản phẩm không tồn tại"));

        for (VariantBulkRequest.VariantItemRequest item : request.getVariants()) {

            ProductVariant variant = new ProductVariant();
            variant.setProduct(product);
            variant.setCode(item.getCode());
            variant.setCostPrice(item.getCostPrice());
            variant.setSellingPrice(item.getSellingPrice());
            variant.setStockQuantity(item.getStockQuantity());
            variant.setIsActive(true);

            List<VariantAttributeValue> vavList = item.getAttributeValueIds().stream().map(attrId -> {
                AttributeValue av = attributeValueRepository.findById(attrId)
                        .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thuộc tính ID: " + attrId));

                VariantAttributeValue vav = new VariantAttributeValue();
                vav.setVariant(variant);
                vav.setAttributeValue(av);
                return vav;
            }).collect(Collectors.toList());

            variant.setVariantAttributeValues(vavList);

            ProductVariant savedVariant = variantRepository.save(variant);

            if (item.getImageUrl() != null) {
                ProductImage img = new ProductImage();
                img.setProduct(product);
                img.setProductVariant(savedVariant);
                img.setImageUrl(item.getImageUrl());
                
                img.setIsPrimary(false);

                img.setDisplayOrder(0);
                productImageRepository.save(img);
            }
        }
    }
