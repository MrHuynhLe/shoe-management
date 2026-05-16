package com.vn.backend.dto.response.pos;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class PosProductSearchResponse {
    private Long productId;
    private Long productVariantId;
    private String variantCode;
    private String barcode;
    private String productCode;
    private String productName;
    private String color;
    private String size;
    private String material;
    private BigDecimal sellingPrice;
    private BigDecimal originalPrice;
    private BigDecimal salePrice;
    private BigDecimal finalPrice;
    private BigDecimal discountAmount;
    private BigDecimal discountPercent;
    private Long promotionId;
    private Integer stockQuantity;
    private Boolean inStock;
    private String imageUrl;
}
