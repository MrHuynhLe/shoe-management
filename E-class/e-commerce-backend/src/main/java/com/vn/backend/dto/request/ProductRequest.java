package com.vn.backend.dto.request;

import lombok.Data;

@Data
public class ProductRequest {
    private String code;
    private String name;
    private String description;
    private Long brandId;
    private Long categoryId;
    private Boolean isActive = true;
}
