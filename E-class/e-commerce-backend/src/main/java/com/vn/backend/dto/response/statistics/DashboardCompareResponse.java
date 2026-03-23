package com.vn.backend.dto.response.statistics;

public record DashboardCompareResponse(
        CompareMetricResponse revenue,
        CompareMetricResponse profit,
        CompareMetricResponse orders,
        CompareMetricResponse itemsSold
) {
}