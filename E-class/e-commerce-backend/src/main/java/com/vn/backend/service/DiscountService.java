package com.vn.backend.service;

import com.vn.backend.dto.request.ValidateDiscountRequest;
import com.vn.backend.dto.response.ValidateDiscountResponse;
import com.vn.backend.entity.Coupon;
import com.vn.backend.security.CustomUserDetails;
import com.vn.backend.dto.response.AvailableVoucherResponse;

import java.math.BigDecimal;
import java.util.List;

public interface DiscountService {
    ValidateDiscountResponse validateDiscount(ValidateDiscountRequest request, CustomUserDetails userDetails);
    ValidateDiscountResponse validateDiscountForSubtotal(String code, BigDecimal subtotal, CustomUserDetails userDetails);
    Coupon findCouponByCode(String code);
}
