package com.vn.backend.dto.response;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ProductResponse {
    private Long id;
    private String code;
    private String name;
    private String description;
    private Long brandId;
    private String brandName;
    private Long categoryId;
    private String categoryName;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime deletedAt;
}
