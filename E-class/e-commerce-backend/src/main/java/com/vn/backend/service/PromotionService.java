package com.vn.backend.service;

import com.vn.backend.dto.request.PromotionRequest;
import com.vn.backend.dto.request.VoucherApplyRequest;
import com.vn.backend.dto.response.PromotionResponse;
import com.vn.backend.dto.response.VoucherApplyResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface PromotionService {
    Page<PromotionResponse> getAllPromotions(Pageable pageable);
    List<PromotionResponse> getAllActivePromotions();
    PromotionResponse getPromotionById(Long id);
    PromotionResponse getPromotionByCode(String code);
    PromotionResponse createPromotion(PromotionRequest request);
    PromotionResponse updatePromotion(Long id, PromotionRequest request);
    void deletePromotion(Long id);
    List<PromotionResponse> getCurrentActivePromotions();
    VoucherApplyResponse applyVoucher(VoucherApplyRequest request);
    void consumeVoucher(String code);
}
