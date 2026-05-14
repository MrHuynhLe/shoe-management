package com.vn.backend.dto.request;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

@Data
public class ProductPromotionRequest {
    @NotBlank
    private String name;
    private String description;
    @NotNull
    @DecimalMin(value = "0.01")
    @DecimalMax(value = "100.00")
    private BigDecimal discountPercent;
    @NotNull
    private OffsetDateTime startDate;
    @NotNull
    private OffsetDateTime endDate;
    private Boolean status = true;
    private List<Long> productIds;
    private List<Long> variantIds;
}
