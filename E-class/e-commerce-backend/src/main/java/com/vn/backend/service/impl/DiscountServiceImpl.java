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
            return validatePromotion(promotionOpt.get(), request.getSubtotal());
        }

        Optional<Coupon> couponOpt = couponRepository.findByCodeAndIsActiveTrue(code);
        if (couponOpt.isPresent()) {
            Customer customer = resolveCustomer(userDetails.getUserId());
            return validateCoupon(couponOpt.get(), customer, request.getSubtotal());
        }


        throw new InvalidRequestException("Mã giảm giá không hợp lệ hoặc đã hết hạn.");
    }

    private ValidateDiscountResponse validatePromotion(Promotion promotion, BigDecimal subtotal) {
        OffsetDateTime now = OffsetDateTime.now();

        if (promotion.getStartDate() != null && now.isBefore(promotion.getStartDate())) {
            throw new InvalidRequestException("Chương trình khuyến mãi chưa bắt đầu.");
        }
        if (promotion.getEndDate() != null && now.isAfter(promotion.getEndDate())) {
            throw new InvalidRequestException("Chương trình khuyến mãi đã kết thúc.");
        }

        if (promotion.getMinOrderValue() != null && subtotal.compareTo(promotion.getMinOrderValue()) < 0) {
            throw new InvalidRequestException("Đơn hàng chưa đạt giá trị tối thiểu để áp dụng khuyến mãi.");
        }

        BigDecimal discountAmount = calculateDiscount(subtotal, promotion.getDiscountType(), promotion.getDiscountValue(), promotion.getMaxDiscountAmount());

        return new ValidateDiscountResponse(promotion.getCode(), discountAmount, "Áp dụng khuyến mãi thành công.");
    }

    private ValidateDiscountResponse validateCoupon(Coupon coupon, Customer customer, BigDecimal subtotal) {
        long usageCount = couponUsageRepository.countByCoupon_IdAndCustomer_Id(coupon.getId(), customer.getId());
        if (usageCount >= coupon.getUsageLimit()) {
            throw new InvalidRequestException("Bạn đã sử dụng hết lượt mã giảm giá này.");
        }

        BigDecimal discountAmount = calculateDiscount(subtotal, coupon.getDiscountType(), coupon.getDiscountValue(), null);

        return new ValidateDiscountResponse(coupon.getCode(), discountAmount, "Áp dụng mã giảm giá thành công.");
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