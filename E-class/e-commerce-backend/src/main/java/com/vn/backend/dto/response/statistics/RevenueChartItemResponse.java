package com.vn.backend.dto.response.statistics;

import java.math.BigDecimal;

public record RevenueChartItemResponse(
        String label,
        Long totalOrders,
        BigDecimal revenue,
        Long itemsSold,
        BigDecimal profit
) {
}