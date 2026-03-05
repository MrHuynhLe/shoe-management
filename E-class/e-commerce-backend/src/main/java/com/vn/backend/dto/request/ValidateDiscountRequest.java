package com.vn.backend.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class ValidateDiscountRequest {
    @NotBlank
    private String code;

    @NotNull
    @DecimalMin("0.0")
    private BigDecimal subtotal;
}