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
public class CheckoutQuoteItemResponse {
    private Long productId;
    private Long variantId;
    private String productName;
    private String variantCode;
    private String size;
    private String color;
    private String imageUrl;
    private Integer quantity;
    private BigDecimal originalPrice;
    private BigDecimal unitPrice;
    private BigDecimal discountPercent;
    private Long promotionId;
    private BigDecimal lineTotal;
}
