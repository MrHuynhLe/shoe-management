package com.vn.backend.service.impl;

import com.vn.backend.dto.request.ValidateDiscountRequest;
import com.vn.backend.dto.response.ValidateDiscountResponse;
import com.vn.backend.entity.*;
import com.vn.backend.exception.InvalidRequestException;
import com.vn.backend.repository.*;
import com.vn.backend.security.CustomUserDetails;
import com.vn.backend.service.DiscountService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class DiscountServiceImpl implements DiscountService {

    private final PromotionRepository promotionRepository;
    private final CouponRepository couponRepository;
    private final CouponUsageRepository couponUsageRepository;
    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;

    @Override
    public ValidateDiscountResponse validateDiscount(ValidateDiscountRequest request, CustomUserDetails userDetails) {
        String code = request.getCode().trim().toUpperCase();

    
        Optional<Promotion> promotionOpt = promotionRepository.findByCode(code);
        if (promotionOpt.isPresent()) {
            Customer customer = resolveCustomer(userDetails.getUserId());
            return validatePromotion(promotionOpt.get(), customer, request.getSubtotal());
        }

        Optional<Coupon> couponOpt = couponRepository.findByCodeAndIsActiveTrue(code);
        if (couponOpt.isPresent()) {
            Customer customer = resolveCustomer(userDetails.getUserId());
            return validateCoupon(couponOpt.get(), customer, request.getSubtotal());
        }


        throw new InvalidRequestException("Mã giảm giá không hợp lệ hoặc đã hết hạn.");
    }

    @Override
    public Coupon findCouponByCode(String code) {
        return couponRepository.findByCodeAndIsActiveTrue(code)
                .orElse(null);
    }

    private ValidateDiscountResponse validatePromotion(Promotion promotion, Customer customer, BigDecimal subtotal) {
        OffsetDateTime now = OffsetDateTime.now();

        if (promotion.getStartDate() != null && now.isBefore(promotion.getStartDate())) {
            throw new InvalidRequestException("Chương trình khuyến mãi chưa bắt đầu.");
        }
        if (promotion.getEndDate() != null && now.isAfter(promotion.getEndDate())) {
            throw new InvalidRequestException("Chương trình khuyến mãi đã kết thúc.");
        }
        if (promotion.getUsageLimit() != null && promotion.getUsageLimit() > 0) {
            long totalUsage = couponUsageRepository.countByPromotion_Id(promotion.getId());
            if (totalUsage >= promotion.getUsageLimit()) {
                throw new InvalidRequestException("Chương trình khuyến mãi đã hết lượt sử dụng.");
            }
        }
        if (promotion.getUsageLimitPerCustomer() != null && promotion.getUsageLimitPerCustomer() > 0) {
            long customerUsage = couponUsageRepository.countByPromotion_IdAndCustomer_Id(promotion.getId(), customer.getId());
            if (customerUsage >= promotion.getUsageLimitPerCustomer()) {
                throw new InvalidRequestException("Bạn đã sử dụng hết lượt của chương trình khuyến mãi này.");
            }
        }

        if (promotion.getMinOrderValue() != null && subtotal.compareTo(promotion.getMinOrderValue()) < 0) {
            throw new InvalidRequestException("Đơn hàng chưa đạt giá trị tối thiểu để áp dụng khuyến mãi.");
        }

        BigDecimal discountAmount = calculateDiscount(
                subtotal,
                promotion.getDiscountType(),
                promotion.getDiscountValue(),
                promotion.getMaxDiscountAmount()
        );

        Integer remainingUsage = null;
        if (promotion.getUsageLimit() != null) {
            long totalUsage = couponUsageRepository.countByPromotion_Id(promotion.getId());
            remainingUsage = Math.max(promotion.getUsageLimit() - (int) totalUsage, 0);
        }

        ValidateDiscountResponse response = new ValidateDiscountResponse();
        response.setCode(promotion.getCode());
        response.setDiscountAmount(discountAmount);
        response.setMessage("Áp dụng khuyến mãi thành công.");
        response.setDiscountType(promotion.getDiscountType());
        response.setDiscountValue(promotion.getDiscountValue());
        response.setMinOrderValue(promotion.getMinOrderValue());
        response.setMaxDiscountAmount(promotion.getMaxDiscountAmount());
        response.setUsageLimit(promotion.getUsageLimit());
        response.setRemainingUsage(remainingUsage);
        return response;
    }

    private ValidateDiscountResponse validateCoupon(Coupon coupon, Customer customer, BigDecimal subtotal) {
        if (coupon.getUsageLimit() != null) {
            long totalUsage = couponUsageRepository.countByCoupon_Id(coupon.getId());
            if (totalUsage >= coupon.getUsageLimit()) {
                throw new InvalidRequestException("Mã giảm giá đã hết lượt sử dụng.");
            }
        }

        long usageCount = couponUsageRepository.countByCoupon_IdAndCustomer_Id(coupon.getId(), customer.getId());
        if (coupon.getUsageLimit() != null && usageCount >= coupon.getUsageLimit()) {
            throw new InvalidRequestException("Bạn đã sử dụng hết lượt mã giảm giá này.");
        }

        BigDecimal discountAmount = calculateDiscount(
                subtotal,
                coupon.getDiscountType(),
                coupon.getDiscountValue(),
                null
        );

        Integer remainingUsage = null;
        if (coupon.getUsageLimit() != null) {
            long totalUsage = couponUsageRepository.countByCoupon_Id(coupon.getId());
            remainingUsage = Math.max(coupon.getUsageLimit() - (int) totalUsage, 0);
        }

        ValidateDiscountResponse response = new ValidateDiscountResponse();
        response.setCode(coupon.getCode());
        response.setDiscountAmount(discountAmount);
        response.setMessage("Áp dụng mã giảm giá thành công.");
        response.setDiscountType(coupon.getDiscountType());
        response.setDiscountValue(coupon.getDiscountValue());
        response.setUsageLimit(coupon.getUsageLimit());
        response.setRemainingUsage(remainingUsage);
        response.setMinOrderValue(BigDecimal.ZERO);
        response.setMaxDiscountAmount(null);
        return response;
    }

    private BigDecimal calculateDiscount(BigDecimal subtotal, String type, BigDecimal value, BigDecimal maxValue) {
        if ("PERCENTAGE".equalsIgnoreCase(type)) {
            BigDecimal discount = subtotal.multiply(value.divide(new BigDecimal("100")));
            if (maxValue != null && discount.compareTo(maxValue) > 0) {
                return maxValue;
            }
            return discount;
        } else if ("FIXED_AMOUNT".equalsIgnoreCase(type)) {
            return value;
        }
        return BigDecimal.ZERO;
    }

    private Customer resolveCustomer(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new InvalidRequestException("User not found"));

        return customerRepository
                .findByUserProfileId(user.getUserProfile().getId())
                .orElseThrow(() -> new InvalidRequestException("Customer not found"));
    }
}