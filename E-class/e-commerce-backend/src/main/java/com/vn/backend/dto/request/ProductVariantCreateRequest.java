package com.vn.backend.dto.request;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class ProductVariantCreateRequest {
    @NotNull
    private Long productId;

    @NotNull
    private BigDecimal costPrice;

    @NotNull
    private BigDecimal sellingPrice;

    // Optional – nếu có nhập kho ngay
    private Integer stockQuantity;

    @NotEmpty
    private List<Long> attributeValueIds;
}
