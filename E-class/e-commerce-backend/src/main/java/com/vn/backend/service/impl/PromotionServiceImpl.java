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

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PromotionServiceImpl implements PromotionService {

    private final PromotionRepository promotionRepository;

    @Override
    public Page<PromotionResponse> getAllPromotions(Pageable pageable) {
        return promotionRepository.findAllActive(pageable)
                .map(this::mapToResponse);
    }

    @Override
    public List<PromotionResponse> getAllActivePromotions() {
        return promotionRepository.findAllActive().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public PromotionResponse getPromotionById(Long id) {
        Promotion promotion = promotionRepository.findByIdActive(id)
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
        Promotion promotion = new Promotion();
        promotion.setCode(request.getCode());
        promotion.setName(request.getName());
        promotion.setDescription(request.getDescription());
        promotion.setDiscountType(request.getDiscountType());
        promotion.setDiscountValue(request.getDiscountValue());
        promotion.setStartDate(request.getStartDate());
        promotion.setEndDate(request.getEndDate());
        promotion.setIsActive(request.getIsActive());

        Promotion savedPromotion = promotionRepository.save(promotion);
        return mapToResponse(savedPromotion);
    }

    @Override
    @Transactional
    public PromotionResponse updatePromotion(Long id, PromotionRequest request) {
        Promotion promotion = promotionRepository.findByIdActive(id)
                .orElseThrow(() -> new RuntimeException("Promotion not found with id: " + id));

        promotion.setCode(request.getCode());
        promotion.setName(request.getName());
        promotion.setDescription(request.getDescription());
        promotion.setDiscountType(request.getDiscountType());
        promotion.setDiscountValue(request.getDiscountValue());
        promotion.setStartDate(request.getStartDate());
        promotion.setEndDate(request.getEndDate());
        promotion.setIsActive(request.getIsActive());

        Promotion updatedPromotion = promotionRepository.save(promotion);
        return mapToResponse(updatedPromotion);
    }

    @Override
    @Transactional
    public void deletePromotion(Long id) {
        Promotion promotion = promotionRepository.findByIdActive(id)
                .orElseThrow(() -> new RuntimeException("Promotion not found with id: " + id));

        promotion.setDeletedAt(LocalDateTime.now());
        promotionRepository.save(promotion);
    }

    @Override
    public List<PromotionResponse> getCurrentActivePromotions() {
        return promotionRepository.findActivePromotions(LocalDateTime.now()).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private PromotionResponse mapToResponse(Promotion promotion) {
        PromotionResponse response = new PromotionResponse();
        response.setId(promotion.getId());
        response.setCode(promotion.getCode());
        response.setName(promotion.getName());
        response.setDescription(promotion.getDescription());
        response.setDiscountType(promotion.getDiscountType());
        response.setDiscountValue(promotion.getDiscountValue());
        response.setStartDate(promotion.getStartDate());
        response.setEndDate(promotion.getEndDate());
        response.setIsActive(promotion.getIsActive());
        response.setCreatedAt(promotion.getCreatedAt());
        return response;
    }
}