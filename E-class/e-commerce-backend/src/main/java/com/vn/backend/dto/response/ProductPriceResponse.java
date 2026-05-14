package com.vn.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductPriceResponse {
    private BigDecimal originalPrice;
    private BigDecimal unitPrice;
    private BigDecimal salePrice;
    private BigDecimal discountPercent;
    private Long promotionId;
    private String promotionName;
    private Boolean isSale;
}
