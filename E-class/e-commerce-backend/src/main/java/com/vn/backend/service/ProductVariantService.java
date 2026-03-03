package com.vn.backend.service;

import com.vn.backend.dto.request.ProductVariantRequest;
import com.vn.backend.dto.response.ProductVariantResponse;

import java.util.List;

public interface ProductVariantService {
    List<ProductVariantResponse> getAllVariants();
    List<ProductVariantResponse> getVariantsByProduct(Long productId);
    ProductVariantResponse getVariantById(Long id);
    ProductVariantResponse getVariantByCode(String code);
    ProductVariantResponse getVariantByBarcode(String barcode);
    // Tạo variant + tự động sinh barcode
    ProductVariantResponse createVariant(ProductVariantRequest request);
    ProductVariantResponse updateVariant(Long id, ProductVariantRequest request);
    void deleteVariant(Long id);
}
