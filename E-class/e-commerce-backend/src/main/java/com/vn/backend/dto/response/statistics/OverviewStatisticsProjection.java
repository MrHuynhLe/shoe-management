package com.vn.backend.dto.response.statistics;

import java.math.BigDecimal;

public interface OverviewStatisticsProjection {
    Long getTotalOrders();
    Long getTotalProductsSold();
    BigDecimal getTotalRevenue();
    Long getTotalCustomers();
}