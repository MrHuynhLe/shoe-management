package com.vn.backend.service;

import com.vn.backend.dto.ghtk.GhtkFeeRequest;

import java.math.BigDecimal;

public interface GhtkService {
    BigDecimal calculateShippingFee(GhtkFeeRequest request);
}