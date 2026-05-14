package com.vn.backend.service.impl;

import com.vn.backend.dto.request.OrderItemRequest;
import com.vn.backend.dto.request.ValidateDiscountRequest;
import com.vn.backend.dto.response.ValidateDiscountResponse;
import com.vn.backend.entity.Coupon;
import com.vn.backend.entity.Customer;
import com.vn.backend.entity.ProductVariant;
import com.vn.backend.entity.Promotion;
import com.vn.backend.entity.User;
import com.vn.backend.exception.InvalidRequestException;
import com.vn.backend.repository.CouponRepository;
import com.vn.backend.repository.CouponUsageRepository;
import com.vn.backend.repository.CustomerRepository;
import com.vn.backend.repository.ProductVariantRepository;
import com.vn.backend.repository.PromotionRepository;
import com.vn.backend.repository.UserRepository;
import com.vn.backend.security.CustomUserDetails;
import com.vn.backend.service.DiscountService;
import com.vn.backend.service.ProductPriceService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class DiscountServiceImpl implements DiscountService {

    private final PromotionRepository promotionRepository;
    private final CouponRepository couponRepository;
    private final CouponUsageRepository couponUsageRepository;
    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;
    private final ProductVariantRepository productVariantRepository;
    private final ProductPriceService productPriceService;

    @Override
    public ValidateDiscountResponse validateDiscount(ValidateDiscountRequest request, CustomUserDetails userDetails) {
        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new InvalidRequestException("Danh sach san pham la bat buoc khi xem truoc voucher.");
        }

        BigDecimal subtotalBeforeVoucher = calculateSubtotalBeforeVoucher(request.getItems());
        return validateDiscountForSubtotal(request.getCode(), subtotalBeforeVoucher, userDetails);
    }

    @Override
    public ValidateDiscountResponse validateDiscountForSubtotal(
            String code,
            BigDecimal subtotal,
            CustomUserDetails userDetails
    ) {
        if (userDetails == null) {
            throw new InvalidRequestException("Ban can dang nhap de su dung voucher.");
        }

        if (code == null || code.isBlank()) {
            throw new InvalidRequestException("Ma giam gia khong duoc de trong.");
        }

        String normalizedCode = code.trim().toUpperCase();
        Customer customer = resolveCustomer(userDetails.getUserId());

        Optional<Promotion> promotionOpt = promotionRepository.findByCode(normalizedCode);
        if (promotionOpt.isPresent()) {
            return validatePromotion(promotionOpt.get(), customer, subtotal);
        }

        Optional<Coupon> couponOpt = couponRepository.findByCodeAndIsActiveTrue(normalizedCode);
        if (couponOpt.isPresent()) {
            return validateCoupon(couponOpt.get(), customer, subtotal);
        }

        throw new InvalidRequestException("Ma giam gia khong hop le hoac da het han.");
    }

    @Override
    public Coupon findCouponByCode(String code) {
        return couponRepository.findByCodeAndIsActiveTrue(code)
                .orElse(null);
    }

    private ValidateDiscountResponse validatePromotion(Promotion promotion, Customer customer, BigDecimal subtotal) {
        OffsetDateTime now = OffsetDateTime.now();

        if (Boolean.FALSE.equals(promotion.getIsActive())) {
            throw new InvalidRequestException("Chuong trinh khuyen mai hien dang tam dung.");
        }

        if (promotion.getStartDate() != null && now.isBefore(promotion.getStartDate())) {
            throw new InvalidRequestException("Chuong trinh khuyen mai chua bat dau.");
        }

        if (promotion.getEndDate() != null && now.isAfter(promotion.getEndDate())) {
            throw new InvalidRequestException("Chuong trinh khuyen mai da ket thuc.");
        }

        if (promotion.getUsageLimit() != null && promotion.getUsageLimit() > 0) {
            long totalUsage = couponUsageRepository.countByPromotion_Id(promotion.getId());
            if (totalUsage >= promotion.getUsageLimit()) {
                throw new InvalidRequestException("Chuong trinh khuyen mai da het luot su dung.");
            }
        }

        if (promotion.getUsageLimitPerCustomer() != null && promotion.getUsageLimitPerCustomer() > 0) {
            long customerUsage = couponUsageRepository.countByPromotion_IdAndCustomer_Id(
                    promotion.getId(),
                    customer.getId()
            );
            if (customerUsage >= promotion.getUsageLimitPerCustomer()) {
                throw new InvalidRequestException("Ban da su dung het luot cua chuong trinh khuyen mai nay.");
            }
        }

        if (promotion.getMinOrderValue() != null && subtotal.compareTo(promotion.getMinOrderValue()) < 0) {
            throw new InvalidRequestException("Don hang chua dat gia tri toi thieu de ap dung khuyen mai.");
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
        response.setDiscountType(promotion.getDiscountType());
        response.setDiscountValue(promotion.getDiscountValue());
        response.setMinOrderValue(promotion.getMinOrderValue());
        response.setMaxDiscountAmount(promotion.getMaxDiscountAmount());
        response.setUsageLimit(promotion.getUsageLimit());
        if (promotion.getUsageLimit() != null && promotion.getUsageLimit() > 0) {
            long totalUsage = couponUsageRepository.countByPromotion_Id(promotion.getId());
            response.setRemainingUsage(Math.max(promotion.getUsageLimit() - (int) totalUsage, 0));
        }
        response.setMessage("Ap dung khuyen mai thanh cong.");
        return response;
    }

    private ValidateDiscountResponse validateCoupon(Coupon coupon, Customer customer, BigDecimal subtotal) {
        long totalUsage = couponUsageRepository.countByCoupon_Id(coupon.getId());
        if (coupon.getUsageLimit() != null && coupon.getUsageLimit() > 0 && totalUsage >= coupon.getUsageLimit()) {
            throw new InvalidRequestException("Ma giam gia da het luot su dung.");
        }

        long customerUsage = couponUsageRepository.countByCoupon_IdAndCustomer_Id(coupon.getId(), customer.getId());
        if (customerUsage > 0) {
            throw new InvalidRequestException("Ban da su dung ma giam gia nay roi.");
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
        response.setDiscountType(coupon.getDiscountType());
        response.setDiscountValue(coupon.getDiscountValue());
        response.setUsageLimit(coupon.getUsageLimit());
        if (coupon.getUsageLimit() != null && coupon.getUsageLimit() > 0) {
            response.setRemainingUsage(Math.max(coupon.getUsageLimit() - (int) totalUsage, 0));
        }
        response.setMessage("Ap dung ma giam gia thanh cong.");
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

    private BigDecimal calculateSubtotalBeforeVoucher(List<OrderItemRequest> items) {
        BigDecimal subtotal = BigDecimal.ZERO;

        for (OrderItemRequest item : items) {
            if (item.getVariantId() == null || item.getQuantity() == null || item.getQuantity() <= 0) {
                throw new InvalidRequestException("San pham hoac so luong khong hop le.");
            }

            ProductVariant variant = productVariantRepository.findById(item.getVariantId())
                    .orElseThrow(() -> new InvalidRequestException("Khong tim thay bien the san pham."));
            BigDecimal unitPrice = productPriceService.calculateCurrentPrice(variant).getUnitPrice();
            subtotal = subtotal.add(defaultZero(unitPrice).multiply(BigDecimal.valueOf(item.getQuantity())));
        }

        return subtotal;
    }

    private Customer resolveCustomer(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new InvalidRequestException("User not found"));

        return customerRepository.findByUserProfileId(user.getUserProfile().getId())
                .orElseThrow(() -> new InvalidRequestException("Customer not found"));
    }

    private BigDecimal defaultZero(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }
}
