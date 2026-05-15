package com.vn.backend.dto.response.pos;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class PosOrderItemResponse {
    private Long itemId;
    private Long productVariantId;
    private String variantCode;
    private String barcode;
    private String productName;
    private String color;
    private String size;
    private String material;
    private BigDecimal price;
    private Integer quantity;
    private BigDecimal lineTotal;
    private Integer stockQuantity;
    private String imageUrl;
}
