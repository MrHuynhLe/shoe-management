package com.vn.backend.service.impl;

import com.vn.backend.dto.request.ProductPromotionRequest;
import com.vn.backend.dto.response.ProductPromotionResponse;
import com.vn.backend.dto.response.PromotionAppliedIdsResponse;
import com.vn.backend.entity.ProductPromotionCampaign;
import com.vn.backend.entity.ProductVariant;
import com.vn.backend.entity.PromotionVariant;
import com.vn.backend.repository.ProductPromotionCampaignRepository;
import com.vn.backend.repository.ProductVariantRepository;
import com.vn.backend.repository.PromotionVariantRepository;
import com.vn.backend.service.ProductPromotionService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductPromotionServiceImpl implements ProductPromotionService {

    private final ProductPromotionCampaignRepository campaignRepository;
    private final PromotionVariantRepository promotionVariantRepository;
    private final ProductVariantRepository productVariantRepository;

    @Override
    @Transactional(readOnly = true)
    public Page<ProductPromotionResponse> getAll(Pageable pageable) {
        return campaignRepository.findAll(pageable).map(this::toResponse);
    }

    @Override
    @Transactional
    public ProductPromotionResponse create(ProductPromotionRequest request) {
        ProductPromotionCampaign promotion = new ProductPromotionCampaign();
        mapRequest(request, promotion);
        ProductPromotionCampaign saved = campaignRepository.save(promotion);
        replaceVariants(saved, resolveVariantIds(request), null);
        return toResponse(saved);
    }

    @Override
    @Transactional
    public ProductPromotionResponse update(Long id, ProductPromotionRequest request) {
        ProductPromotionCampaign promotion = campaignRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy đợt giảm giá"));
        mapRequest(request, promotion);
        replaceVariants(promotion, resolveVariantIds(request), id);
        return toResponse(promotion);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        ProductPromotionCampaign promotion = campaignRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy đợt giảm giá"));
        promotion.setStatus(false);
        campaignRepository.save(promotion);
    }

    @Override
    @Transactional
    public ProductPromotionResponse toggle(Long id) {
        ProductPromotionCampaign promotion = campaignRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy đợt giảm giá"));
        promotion.setStatus(!Boolean.TRUE.equals(promotion.getStatus()));
        return toResponse(promotion);
    }

    @Override
    @Transactional(readOnly = true)
    public PromotionAppliedIdsResponse getAppliedIds(Long id) {
        List<PromotionVariant> rows = promotionVariantRepository.findByPromotionIdWithVariant(id);
        List<Long> variantIds = rows.stream()
                .map(row -> row.getVariant().getId())
                .distinct()
                .toList();
        List<Long> productIds = rows.stream()
                .map(row -> row.getVariant().getProduct().getId())
                .distinct()
                .toList();
        return new PromotionAppliedIdsResponse(productIds, variantIds);
    }

    private void mapRequest(ProductPromotionRequest request, ProductPromotionCampaign promotion) {
        if (request.getEndDate().isBefore(request.getStartDate())) {
            throw new IllegalArgumentException("Ngày kết thúc phải sau ngày bắt đầu");
        }
        promotion.setName(request.getName().trim());
        promotion.setDescription(request.getDescription());
        promotion.setDiscountPercent(request.getDiscountPercent());
        promotion.setStartDate(request.getStartDate());
        promotion.setEndDate(request.getEndDate());
        promotion.setStatus(request.getStatus() != null ? request.getStatus() : true);
    }

    private Set<Long> resolveVariantIds(ProductPromotionRequest request) {
        Set<Long> ids = new LinkedHashSet<>();
        if (!CollectionUtils.isEmpty(request.getVariantIds())) {
            ids.addAll(request.getVariantIds());
        }
        if (!CollectionUtils.isEmpty(request.getProductIds())) {
            request.getProductIds().forEach(productId ->
                    productVariantRepository.findByProductId(productId).stream()
                            .filter(v -> v.getDeletedAt() == null)
                            .filter(v -> Boolean.TRUE.equals(v.getIsActive()))
                            .map(ProductVariant::getId)
                            .forEach(ids::add)
            );
        }
        if (ids.isEmpty()) {
            throw new IllegalArgumentException("Vui lòng chọn sản phẩm hoặc biến thể áp dụng");
        }
        return ids;
    }

    private void replaceVariants(ProductPromotionCampaign promotion, Set<Long> variantIds, Long excludePromotionId) {
        List<PromotionVariant> conflicts = promotionVariantRepository.findActiveConflicts(
                variantIds,
                OffsetDateTime.now(),
                excludePromotionId
        );
        if (!conflicts.isEmpty()) {
            String conflictCodes = conflicts.stream()
                    .map(row -> row.getVariant().getCode())
                    .distinct()
                    .collect(Collectors.joining(", "));
            throw new IllegalStateException("Biến thể đang thuộc đợt giảm giá khác: " + conflictCodes);
        }

        promotionVariantRepository.deleteByPromotion_Id(promotion.getId());
        List<ProductVariant> variants = productVariantRepository.findAllById(new ArrayList<>(variantIds));
        if (variants.size() != variantIds.size()) {
            throw new IllegalArgumentException("Danh sách biến thể không hợp lệ");
        }

        List<PromotionVariant> rows = variants.stream().map(variant -> {
            PromotionVariant pv = new PromotionVariant();
            pv.setPromotion(promotion);
            pv.setVariant(variant);
            return pv;
        }).toList();
        promotionVariantRepository.saveAll(rows);
    }

    private ProductPromotionResponse toResponse(ProductPromotionCampaign promotion) {
        List<PromotionVariant> rows = promotion.getId() == null
                ? List.of()
                : promotionVariantRepository.findByPromotionIdWithVariant(promotion.getId());

        ProductPromotionResponse response = new ProductPromotionResponse();
        response.setId(promotion.getId());
        response.setName(promotion.getName());
        response.setDescription(promotion.getDescription());
        response.setDiscountPercent(promotion.getDiscountPercent());
        response.setStartDate(promotion.getStartDate());
        response.setEndDate(promotion.getEndDate());
        response.setStatus(promotion.getStatus());
        response.setCreatedAt(promotion.getCreatedAt());
        response.setUpdatedAt(promotion.getUpdatedAt());
        response.setVariantCount(rows.size());
        response.setProductCount(rows.stream().map(row -> row.getVariant().getProduct().getId()).distinct().count());
        return response;
    }
}
