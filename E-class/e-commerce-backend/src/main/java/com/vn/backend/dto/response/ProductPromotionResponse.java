package com.vn.backend.dto.response;

import lombok.Data;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Data
public class ProductPromotionResponse {
    private Long id;
    private String name;
    private String description;
    private BigDecimal discountPercent;
    private OffsetDateTime startDate;
    private OffsetDateTime endDate;
    private Boolean status;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
    private long productCount;
    private long variantCount;
}
