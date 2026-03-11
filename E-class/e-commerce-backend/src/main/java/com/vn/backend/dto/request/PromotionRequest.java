package com.vn.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Data
public class PromotionRequest {
    @NotBlank
    private String code;
    @NotBlank
    private String name;
    @NotBlank
    private String discountType;
    @NotNull
    private BigDecimal discountValue;
    private BigDecimal minOrderValue;
    private BigDecimal maxDiscountAmount;
    private Integer usageLimit;
    @NotNull
    private Integer usageLimitPerCustomer;
    private OffsetDateTime startDate;
    private OffsetDateTime endDate;
    private Boolean isActive;
}