package com.vn.backend.dto.request;

import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class ProductVariantUpdateRequest {

    private String code;
    private String barcode;
    private BigDecimal costPrice;
    private BigDecimal sellingPrice;
    private Integer stockQuantity;
    private String binLocation;
    private Boolean isActive;

    private List<Long> attributeValueIds;
}