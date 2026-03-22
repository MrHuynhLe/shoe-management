package com.vn.backend.dto.response.statistics;

import java.math.BigDecimal;

public record TopCustomerResponse(
        Integer customerId,
        String customerCode,
        String fullName,
        Long totalOrders,
        BigDecimal totalSpent
) {
}