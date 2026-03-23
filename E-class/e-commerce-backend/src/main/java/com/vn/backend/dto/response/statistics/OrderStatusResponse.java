package com.vn.backend.dto.response.statistics;

import java.math.BigDecimal;

public record OrderStatusResponse(
        String status,
        Long totalOrders,
        BigDecimal totalAmount
) {
}