package com.vn.backend.service.impl;

import com.vn.backend.dto.request.ValidateDiscountRequest;
import com.vn.backend.dto.response.ValidateDiscountResponse;
import com.vn.backend.entity.Coupon;
import com.vn.backend.entity.Customer;
import com.vn.backend.entity.Promotion;
import com.vn.backend.entity.User;
import com.vn.backend.exception.InvalidRequestException;
import com.vn.backend.repository.CouponRepository;
import com.vn.backend.repository.CouponUsageRepository;
import com.vn.backend.repository.CustomerRepository;
import com.vn.backend.repository.PromotionRepository;
import com.vn.backend.repository.UserRepository;
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
        if (userDetails == null) {
            throw new InvalidRequestException("Bạn cần đăng nhập để sử dụng voucher.");
        }

        String code = request.getCode().trim().toUpperCase();
        Customer customer = resolveCustomer(userDetails.getUserId());

        Optional<Promotion> promotionOpt = promotionRepository.findByCode(code);
        if (promotionOpt.isPresent()) {
            return validatePromotion(promotionOpt.get(), customer, request.getSubtotal());
        }

        Optional<Coupon> couponOpt = couponRepository.findByCodeAndIsActiveTrue(code);
        if (couponOpt.isPresent()) {
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

        if (Boolean.FALSE.equals(promotion.getIsActive())) {
            throw new InvalidRequestException("Chương trình khuyến mãi hiện đang tạm dừng.");
        }

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
            long customerUsage = couponUsageRepository.countByPromotion_IdAndCustomer_Id(
                    promotion.getId(),
                    customer.getId()
            );
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

        ValidateDiscountResponse response = new ValidateDiscountResponse();
        response.setCode(promotion.getCode());
        response.setDiscountAmount(discountAmount);
        response.setMessage("Áp dụng khuyến mãi thành công.");
        return response;
    }

    private ValidateDiscountResponse validateCoupon(Coupon coupon, Customer customer, BigDecimal subtotal) {
        long totalUsage = couponUsageRepository.countByCoupon_Id(coupon.getId());
        if (coupon.getUsageLimit() != null && coupon.getUsageLimit() > 0 && totalUsage >= coupon.getUsageLimit()) {
            throw new InvalidRequestException("Mã giảm giá đã hết lượt sử dụng.");
        }

        long customerUsage = couponUsageRepository.countByCoupon_IdAndCustomer_Id(coupon.getId(), customer.getId());
        if (customerUsage > 0) {
            throw new InvalidRequestException("Bạn đã sử dụng mã giảm giá này rồi.");
        }

        BigDecimal discountAmount = calculateDiscount(
                subtotal,
                coupon.getDiscountType(),
                coupon.getDiscountValue(),
                null
        );

        ValidateDiscountResponse response = new ValidateDiscountResponse();
        response.setCode(coupon.getCode());
        response.setDiscountAmount(discountAmount);
        response.setMessage("Áp dụng mã giảm giá thành công.");
        return response;
    }

    private BigDecimal calculateDiscount(BigDecimal subtotal, String type, BigDecimal value, BigDecimal maxValue) {
        if (subtotal == null || subtotal.compareTo(BigDecimal.ZERO) <= 0 || type == null || value == null) {
            return BigDecimal.ZERO;
        }

        BigDecimal discount = BigDecimal.ZERO;

        if ("PERCENTAGE".equalsIgnoreCase(type)) {
            discount = subtotal.multiply(value).divide(BigDecimal.valueOf(100));
            if (maxValue != null && discount.compareTo(maxValue) > 0) {
                discount = maxValue;
            }
        } else if ("FIXED_AMOUNT".equalsIgnoreCase(type)) {
            discount = value;
        }

        return discount.min(subtotal);
    }

    private Customer resolveCustomer(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new InvalidRequestException("User not found"));

        return customerRepository.findByUserProfileId(user.getUserProfile().getId())
                .orElseThrow(() -> new InvalidRequestException("Customer not found"));
    }
}