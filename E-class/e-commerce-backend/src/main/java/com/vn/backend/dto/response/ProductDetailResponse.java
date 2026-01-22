package com.vn.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProductDetailResponse {
    private Long id;
    private String code;
    private String name;
    private String description;
    private String brandName;
    private String categoryName;
    private String originName;
    private Boolean isActive;
    private OffsetDateTime deletedAt;
    private List<ProductVariantResponse> variants;
    private List<String> images;
}
