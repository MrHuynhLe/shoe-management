package com.vn.backend.dto.response.statistics;

import java.math.BigDecimal;

public record DashboardResponse(
        Long totalOrders,
        BigDecimal totalRevenue,
        Long totalItemsSold,
        BigDecimal totalProfit,
        Long totalStock,
        Long lowStockCount
) {
}