package com.vn.backend.dto.response.statistics;

import java.math.BigDecimal;

public interface TopProductResponse {
    Integer getProductId();
    String getProductCode();
    String getProductName();
    String getBrandName();
    String getCategoryName();
    Long getTotalSold();
    BigDecimal getRevenue();
    BigDecimal getProfit();
}