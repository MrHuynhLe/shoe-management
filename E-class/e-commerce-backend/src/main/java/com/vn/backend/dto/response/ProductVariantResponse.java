package com.vn.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.Map;
@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProductVariantResponse {

    private Long id;
    private String code;
    private BigDecimal costPrice;
    private BigDecimal sellingPrice;
    private Integer stockQuantity;
    private Boolean isActive;
    private Map<String, String> attributes;
}
