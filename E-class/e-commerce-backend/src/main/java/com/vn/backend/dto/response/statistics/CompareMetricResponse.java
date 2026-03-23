package com.vn.backend.dto.response.statistics;

import java.math.BigDecimal;

public record CompareMetricResponse(
        BigDecimal currentValue,
        BigDecimal previousValue,
        BigDecimal diffValue,
        BigDecimal diffPercent
) {
}