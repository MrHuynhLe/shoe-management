package com.vn.backend.service;

import com.vn.backend.dto.request.ProductVariantCreateRequest;
import com.vn.backend.dto.request.VariantBulkRequest;
import com.vn.backend.dto.response.ProductVariantResponse;

import java.util.List;

public interface ProductVariantService {

    ProductVariantResponse create(ProductVariantCreateRequest request);

    List<ProductVariantResponse> createBulk(VariantBulkRequest request);

    List<ProductVariantResponse> getByProductId(Long productId);
}