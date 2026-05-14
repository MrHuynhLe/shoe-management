package com.vn.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderItemResponse {
    private Long productId;
    private String productName;
    private String variantInfo;
    private String imageUrl;
    private int quantity;
    private BigDecimal price;
    private BigDecimal originalPrice;
    private BigDecimal unitPrice;
    private BigDecimal salePrice;
    private BigDecimal productDiscountPercent;
    private BigDecimal productDiscountAmount;
    private Long promotionId;
    private Boolean isSale;
    private BigDecimal subtotal;
    private BigDecimal lineTotal;
}
