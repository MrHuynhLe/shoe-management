package com.vn.backend.dto.response.pos;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PosProductSearchResponse {
    private Integer variantId;
    private String variantCode;
    private String barcode;
    private String productCode;
    private String productName;
    private Double sellingPrice;
    private Integer stockQuantity;
    private String imageUrl;
}