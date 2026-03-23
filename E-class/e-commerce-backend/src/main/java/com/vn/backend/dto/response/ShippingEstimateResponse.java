package com.vn.backend.dto.response;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class ShippingEstimateResponse {
    private BigDecimal shippingFee;
}