package com.vn.backend.dto.response.statistics;

import java.math.BigDecimal;

public record TopRatedProductResponse(
        Integer productId,
        String productCode,
        String productName,
        Long totalReviews,
        BigDecimal avgRating
) {
}