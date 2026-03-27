package com.vn.backend.service;

import com.vn.backend.dto.request.ProductVariantCreateRequest;
import com.vn.backend.dto.request.VariantBulkRequest;
import com.vn.backend.dto.response.ProductVariantResponse;
import org.springframework.stereotype.Service;

import java.util.List;
@Service
public interface ProductVariantService {
    ProductVariantResponse create(ProductVariantCreateRequest request);
    List<ProductVariantResponse> createBulk(VariantBulkRequest request);
    List<ProductVariantResponse> getByProductId(Long productId);
    void delete(Long variantId);
}