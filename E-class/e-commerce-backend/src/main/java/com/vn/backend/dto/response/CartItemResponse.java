package com.vn.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;
import java.util.Map;

@Data
@AllArgsConstructor

public class CartItemResponse {
    private Long cartItemId;
    private Long productVariantId;
    private String productName;
    private String imageUrl;

    private BigDecimal price;
    private int quantity;
    private BigDecimal totalPrice;

    private Map<String, String> attributes;
}