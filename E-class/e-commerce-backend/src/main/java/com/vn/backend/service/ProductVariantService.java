package com.vn.backend.service;

import com.vn.backend.dto.request.ProductVariantRequest;

public interface ProductVariantService {
    void createVariants(ProductVariantRequest request);
}
