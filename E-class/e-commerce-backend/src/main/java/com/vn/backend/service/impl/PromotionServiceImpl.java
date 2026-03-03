package com.vn.backend.service.impl;

import com.vn.backend.dto.request.PromotionRequest;
import com.vn.backend.dto.response.PromotionResponse;
import com.vn.backend.entity.Promotion;
import com.vn.backend.repository.PromotionRepository;
import com.vn.backend.service.PromotionService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PromotionServiceImpl implements PromotionService {
//iml
    private final PromotionRepository promotionRepository;

    @Override
    public Page<PromotionResponse> getAllPromotions(Pageable pageable) {
        return promotionRepository.findAll(pageable)
                .map(this::mapToResponse);
    }

    @Override
    public List<PromotionResponse> getAllActivePromotions() {
        return promotionRepository.findAllActive().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<PromotionResponse> getCurrentActivePromotions() {
        return promotionRepository.findCurrentlyValid(LocalDateTime.now()).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public PromotionResponse getPromotionById(Long id) {
        Promotion promotion = promotionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Promotion not found with id: " + id));
        return mapToResponse(promotion);
    }

    @Override
    public PromotionResponse getPromotionByCode(String code) {
        Promotion promotion = promotionRepository.findByCode(code)
                .orElseThrow(() -> new RuntimeException("Promotion not found with code: " + code));
        return mapToResponse(promotion);
    }

    @Override
    @Transactional
    public PromotionResponse createPromotion(PromotionRequest request) {
        if (promotionRepository.findByCode(request.getCode()).isPresent()) {
            throw new RuntimeException("Promotion code already exists: " + request.getCode());
        }
        Promotion promotion = mapFromRequest(request);
        return mapToResponse(promotionRepository.save(promotion));
    }

    @Override
    @Transactional
    public PromotionResponse updatePromotion(Long id, PromotionRequest request) {
        Promotion promotion = promotionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Promotion not found with id: " + id));

        if (request.getCode() != null) promotion.setCode(request.getCode());
        if (request.getName() != null) promotion.setName(request.getName());
        if (request.getDiscountType() != null) promotion.setDiscountType(request.getDiscountType());
        if (request.getDiscountValue() != null) promotion.setDiscountValue(request.getDiscountValue());
        if (request.getMinOrderValue() != null) promotion.setMinOrderValue(request.getMinOrderValue());
        if (request.getMaxDiscountAmount() != null) promotion.setMaxDiscountAmount(request.getMaxDiscountAmount());
        if (request.getUsageLimit() != null) promotion.setUsageLimit(request.getUsageLimit());
        if (request.getStartDate() != null) promotion.setStartDate(request.getStartDate());
        if (request.getEndDate() != null) promotion.setEndDate(request.getEndDate());
        if (request.getIsActive() != null) promotion.setIsActive(request.getIsActive());

        return mapToResponse(promotionRepository.save(promotion));
    }

    @Override
    @Transactional
    public void deletePromotion(Long id) {
        if (!promotionRepository.existsById(id)) {
            throw new RuntimeException("Promotion not found with id: " + id);
        }
        promotionRepository.deleteById(id);
    }

    private Promotion mapFromRequest(PromotionRequest request) {
        Promotion p = new Promotion();
        p.setCode(request.getCode());
        p.setName(request.getName());
        p.setDiscountType(request.getDiscountType());
        p.setDiscountValue(request.getDiscountValue());
        p.setMinOrderValue(request.getMinOrderValue() != null ? request.getMinOrderValue() : BigDecimal.ZERO);
        p.setMaxDiscountAmount(request.getMaxDiscountAmount());
        p.setUsageLimit(request.getUsageLimit());
        p.setStartDate(request.getStartDate());
        p.setEndDate(request.getEndDate());
        p.setIsActive(request.getIsActive() != null ? request.getIsActive() : true);
        return p;
    }

    private PromotionResponse mapToResponse(Promotion p) {
        PromotionResponse r = new PromotionResponse();
        r.setId(p.getId());
        r.setCode(p.getCode());
        r.setName(p.getName());
        r.setDiscountType(p.getDiscountType());
        r.setDiscountValue(p.getDiscountValue());
        r.setMinOrderValue(p.getMinOrderValue());
        r.setMaxDiscountAmount(p.getMaxDiscountAmount());
        r.setUsageLimit(p.getUsageLimit());
        r.setStartDate(p.getStartDate());
        r.setEndDate(p.getEndDate());
        r.setIsActive(p.getIsActive());
        return r;
    }
}
