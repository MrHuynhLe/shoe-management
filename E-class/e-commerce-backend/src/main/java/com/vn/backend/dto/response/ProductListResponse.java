package com.vn.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductListResponse {

    private Long id;
    private String code;
    private String name;
    private String brandName;
    private String categoryName;
    private String imageUrl;
    private Integer totalStock;
    private BigDecimal minPrice;
    private BigDecimal maxPrice;
    private BigDecimal minCostPrice;
    private BigDecimal maxCostPrice;
    private Boolean isActive;
    private BigDecimal minOriginalPrice;
    private BigDecimal maxOriginalPrice;
    private BigDecimal salePrice;
    private BigDecimal minSalePrice;
    private BigDecimal maxSalePrice;
    private BigDecimal discountPercent;
    private Boolean isSale = false;
    private Integer saleVariantCount = 0;
    private Integer activeVariantCount = 0;

    public ProductListResponse(
            Long id,
            String code,
            String name,
            String brandName,
            String imageUrl,
            Long totalStock,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            BigDecimal minCostPrice,
            BigDecimal maxCostPrice,
            Boolean isActive
    ) {
        this.id = id;
        this.code = code;
        this.name = name;
        this.brandName = brandName;
        this.imageUrl = imageUrl;
        this.totalStock = totalStock == null ? 0 : totalStock.intValue();
        this.minPrice = minPrice;
        this.maxPrice = maxPrice;
        this.minCostPrice = minCostPrice;
        this.maxCostPrice = maxCostPrice;
        this.isActive = isActive;
        this.minOriginalPrice = minPrice;
        this.maxOriginalPrice = maxPrice;
        this.minSalePrice = minPrice;
        this.maxSalePrice = maxPrice;
        this.salePrice = minPrice;
        this.isSale = false;
    }
}
