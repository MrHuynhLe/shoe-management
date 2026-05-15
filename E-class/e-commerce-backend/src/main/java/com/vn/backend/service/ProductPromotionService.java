package com.vn.backend.service;

import com.vn.backend.dto.request.ProductPromotionRequest;
import com.vn.backend.dto.response.ProductPromotionResponse;
import com.vn.backend.dto.response.PromotionAppliedIdsResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ProductPromotionService {
    Page<ProductPromotionResponse> getAll(Pageable pageable);
    ProductPromotionResponse create(ProductPromotionRequest request);
    ProductPromotionResponse update(Long id, ProductPromotionRequest request);
    void delete(Long id);
    ProductPromotionResponse toggle(Long id);
    PromotionAppliedIdsResponse getAppliedIds(Long id);
}
