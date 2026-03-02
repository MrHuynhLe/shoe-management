package com.vn.backend.service.impl;

import com.vn.backend.dto.request.PromotionRequest;
import com.vn.backend.dto.request.VoucherApplyRequest;
import com.vn.backend.dto.response.PromotionResponse;
import com.vn.backend.dto.response.VoucherApplyResponse;
import com.vn.backend.entity.Promotion;
import com.vn.backend.repository.PromotionRepository;
import com.vn.backend.service.PromotionService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
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
        promotion.setMinOrderAmount(request.getMinOrderAmount());
        promotion.setMaxUsage(request.getMaxUsage());
        promotion.setUsedCount(0);
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
        promotion.setMinOrderAmount(request.getMinOrderAmount());
        promotion.setMaxUsage(request.getMaxUsage());
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

    @Override
    @Transactional
    public VoucherApplyResponse applyVoucher(VoucherApplyRequest request) {
        Optional<Promotion> optPromotion = promotionRepository.findByCode(request.getCode());

        if (optPromotion.isEmpty()) {
            return VoucherApplyResponse.builder()
                    .valid(false)
                    .message("Mã voucher không tồn tại")
                    .build();
        }

        Promotion promotion = optPromotion.get();
        LocalDateTime now = LocalDateTime.now();

        if (!Boolean.TRUE.equals(promotion.getIsActive())) {
            return VoucherApplyResponse.builder()
                    .valid(false).voucherCode(promotion.getCode())
                    .message("Voucher đã bị vô hiệu hoá")
                    .build();
        }

        if (promotion.getStartDate() != null && now.isBefore(promotion.getStartDate())) {
            return VoucherApplyResponse.builder()
                    .valid(false).voucherCode(promotion.getCode())
                    .message("Voucher chưa đến thời gian áp dụng")
                    .build();
        }

        if (promotion.getEndDate() != null && now.isAfter(promotion.getEndDate())) {
            return VoucherApplyResponse.builder()
                    .valid(false).voucherCode(promotion.getCode())
                    .message("Voucher đã hết hạn")
                    .build();
        }

        if (promotion.getMaxUsage() != null && promotion.getUsedCount() >= promotion.getMaxUsage()) {
            return VoucherApplyResponse.builder()
                    .valid(false).voucherCode(promotion.getCode())
                    .message("Voucher đã hết lượt sử dụng")
                    .build();
        }

        if (promotion.getMinOrderAmount() != null
                && request.getOrderAmount().compareTo(promotion.getMinOrderAmount()) < 0) {
            return VoucherApplyResponse.builder()
                    .valid(false).voucherCode(promotion.getCode())
                    .message("Đơn hàng tối thiểu " + promotion.getMinOrderAmount().toPlainString() + "₫ để áp dụng voucher này")
                    .build();
        }

        BigDecimal discountAmount;
        if ("PERCENTAGE".equals(promotion.getDiscountType())) {
            discountAmount = request.getOrderAmount()
                    .multiply(promotion.getDiscountValue())
                    .divide(BigDecimal.valueOf(100), 0, RoundingMode.FLOOR);
        } else {
            discountAmount = promotion.getDiscountValue();
        }

        if (discountAmount.compareTo(request.getOrderAmount()) > 0) {
            discountAmount = request.getOrderAmount();
        }

        return VoucherApplyResponse.builder()
                .valid(true)
                .voucherCode(promotion.getCode())
                .voucherName(promotion.getName())
                .discountType(promotion.getDiscountType())
                .discountAmount(discountAmount)
                .message("Áp dụng voucher thành công")
                .build();
    }

    @Override
    @Transactional
    public void consumeVoucher(String code) {
        Promotion promotion = promotionRepository.findByCode(code)
                .orElseThrow(() -> new RuntimeException("Promotion not found: " + code));
        promotion.setUsedCount(promotion.getUsedCount() + 1);
        promotionRepository.save(promotion);
    }

    private PromotionResponse mapToResponse(Promotion promotion) {
        PromotionResponse response = new PromotionResponse();
        response.setId(promotion.getId());
        response.setCode(promotion.getCode());
        response.setName(promotion.getName());
        response.setDescription(promotion.getDescription());
        response.setDiscountType(promotion.getDiscountType());
        response.setDiscountValue(promotion.getDiscountValue());
        response.setMinOrderAmount(promotion.getMinOrderAmount());
        response.setMaxUsage(promotion.getMaxUsage());
        response.setUsedCount(promotion.getUsedCount());
        response.setStartDate(promotion.getStartDate());
        response.setEndDate(promotion.getEndDate());
        response.setIsActive(promotion.getIsActive());
        response.setCreatedAt(promotion.getCreatedAt());
        return response;
    }
}
