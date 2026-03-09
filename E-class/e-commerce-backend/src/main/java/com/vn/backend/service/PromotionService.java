package com.vn.backend.service;

import com.vn.backend.dto.request.PromotionRequest;
import com.vn.backend.dto.response.PromotionResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

public interface PromotionService {
    Page<PromotionResponse> getAll(Pageable pageable);
    Page<PromotionResponse> getPublicActivePromotions(Pageable pageable);
    PromotionResponse getById(Long id);
    PromotionResponse create(PromotionRequest request);
    PromotionResponse update(Long id, PromotionRequest request);
    void delete(Long id);
}