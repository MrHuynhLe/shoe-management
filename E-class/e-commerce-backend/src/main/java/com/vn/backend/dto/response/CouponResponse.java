package com.vn.backend.dto.response;

import lombok.Data;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Data
public class CouponResponse {
    private Long id;
    private String code;
    private String discountType;
    private BigDecimal discountValue;
    private Integer usageLimit;
    private Boolean isActive;
    private OffsetDateTime createdAt;
}