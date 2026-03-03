package com.vn.backend.dto.request;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.Set;

@Getter @Setter
public class ProductVariantRequest {
    // productId is required
    private Long productId;
    // code is optional — auto-generated as SKU if not provided
    private String code;
    private String barcode;
    private BigDecimal costPrice;
    private BigDecimal sellingPrice;
    private Integer stockQuantity;
    private String binLocation;
    private Boolean isActive;
    // IDs of AttributeValues to associate (e.g., Size=42, Color=Red)
    private Set<Long> attributeValueIds;
}
