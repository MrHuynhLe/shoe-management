package com.vn.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CartItemResponse {

    private Long cartItemId;
    private Long productId;
    private Long variantId;

    private String productName;
    private String variantCode;

    private String size;
    private String color;

    private BigDecimal price;
    private Integer quantity;
    private Integer stockRemaining;
    private BigDecimal subTotal;
    private String imageUrl;
}