package com.vn.backend.service;
import com.vn.backend.dto.request.ProductVariantCreateRequest;
import com.vn.backend.dto.response.ProductVariantResponse;

import java.util.List;

public interface ProductVariantService {

    List<ProductVariantResponse> getAllVariants();

    List<ProductVariantResponse> getVariantsByProduct(Long productId);

    ProductVariantResponse getVariantDetail(Long id);

    // create


    ProductVariantResponse create(ProductVariantCreateRequest request);
}