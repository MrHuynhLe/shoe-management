package com.vn.backend.service;

import com.vn.backend.dto.request.VariantBulkRequest;

public interface ProductVariantService {
    void createBulkVariants(VariantBulkRequest request);
}