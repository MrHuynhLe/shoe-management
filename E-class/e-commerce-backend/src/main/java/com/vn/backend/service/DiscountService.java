package com.vn.backend.service;

import com.vn.backend.dto.request.ValidateDiscountRequest;
import com.vn.backend.dto.response.ValidateDiscountResponse;
import com.vn.backend.security.CustomUserDetails;

public interface DiscountService {
    ValidateDiscountResponse validateDiscount(ValidateDiscountRequest request, CustomUserDetails userDetails);
}