package com.vn.backend.dto.response.statistics;

import java.math.BigDecimal;

public record PaymentMethodRevenueResponse(
        String paymentMethodCode,
        String paymentMethodName,
        Long totalOrders,
        BigDecimal revenue
) {
}