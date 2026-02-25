package com.vn.backend.service;
import com.vn.backend.dto.request.ProductVariantCreateRequest;
import com.vn.backend.dto.response.ProductVariantResponse;
import java.util.List;
import com.vn.backend.dto.request.VariantBulkRequest;

public interface ProductVariantService {
    void createBulkVariants(VariantBulkRequest request);
  


}