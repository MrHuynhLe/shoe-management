package com.vn.backend.dto.response.statistics;

import java.math.BigDecimal;

public record TopEmployeeResponse(
        Integer employeeId,
        String employeeCode,
        String fullName,
        Long totalOrders,
        BigDecimal revenue
) {
}