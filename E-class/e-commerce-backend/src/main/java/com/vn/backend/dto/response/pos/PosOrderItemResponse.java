package com.vn.backend.dto.response.pos;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PosOrderItemResponse {
    private Integer itemId;
    private Integer variantId;
    private String variantCode;
    private String barcode;
    private String productName;
    private Double price;
    private Integer quantity;
    private Double lineTotal;
    private Integer stockQuantity;
    private String imageUrl;
}