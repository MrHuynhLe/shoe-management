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
    private String barcode;
    private BigDecimal costPrice;
    private BigDecimal sellingPrice;
    private Integer stockQuantity;
    private String binLocation;
    private Boolean isActive;
    private Map<String, String> attributes;
    private BigDecimal originalPrice;
    private BigDecimal unitPrice;
    private BigDecimal salePrice;
    private BigDecimal discountPercent;
    private Boolean isSale;
    private Long promotionId;
    private String promotionName;

    public ProductVariantResponse(
            Long id,
            String code,
            String barcode,
            BigDecimal costPrice,
            BigDecimal sellingPrice,
            Integer stockQuantity,
            String binLocation,
            Boolean isActive,
            Map<String, String> attributes
    ) {
        this.id = id;
        this.code = code;
        this.barcode = barcode;
        this.costPrice = costPrice;
        this.sellingPrice = sellingPrice;
        this.stockQuantity = stockQuantity;
        this.binLocation = binLocation;
        this.isActive = isActive;
        this.attributes = attributes;
        this.originalPrice = sellingPrice;
        this.unitPrice = sellingPrice;
        this.salePrice = sellingPrice;
        this.discountPercent = BigDecimal.ZERO;
        this.isSale = false;
    }
}
