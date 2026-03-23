package com.vn.backend.dto.response.statistics;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OverviewStatisticsResponse {
    private Long totalOrders;
    private Long totalProductsSold;
    private Double totalRevenue;
    private Long totalCustomers;
}