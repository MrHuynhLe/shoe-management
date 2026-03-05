package com.vn.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class CouponRequest {
    @NotBlank
    private String code;
    @NotBlank
    private String discountType;
    @NotNull
    private BigDecimal discountValue;
    private Integer usageLimit;
    private Boolean isActive;
}