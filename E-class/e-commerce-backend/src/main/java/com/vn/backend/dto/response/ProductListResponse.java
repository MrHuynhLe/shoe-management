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
    private String imageUrl;
    private Integer totalStock;
    private BigDecimal minPrice;
    private BigDecimal maxPrice;
    private BigDecimal minCostPrice;
    private BigDecimal maxCostPrice;
    private Boolean isActive;

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
    }
}
