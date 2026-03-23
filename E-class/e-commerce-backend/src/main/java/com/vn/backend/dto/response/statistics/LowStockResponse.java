package com.vn.backend.dto.response.statistics;

public record LowStockResponse(
        Integer variantId,
        String variantCode,
        String productName,
        Integer stockQuantity,
        String binLocation
) {
}