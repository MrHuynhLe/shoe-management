package com.vn.backend.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProductImageCreateRequest {

    private Long productId;

    // nullable → ảnh chung
    private Long productVariantId;

    private String imageUrl;

    private Boolean isPrimary;

    private Integer displayOrder;
}