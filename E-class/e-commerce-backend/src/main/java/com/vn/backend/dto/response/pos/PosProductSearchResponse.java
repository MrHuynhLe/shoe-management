package com.vn.backend.dto.response.pos;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class PosProductSearchResponse {
    private Long productVariantId;
    private String variantCode;
    private String barcode;
    private String productCode;
    private String productName;
    private String color;
    private String size;
    private BigDecimal sellingPrice;
    private Integer stockQuantity;
    private String imageUrl;
}