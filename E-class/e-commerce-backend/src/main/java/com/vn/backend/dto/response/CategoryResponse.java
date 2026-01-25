package com.vn.backend.dto.response;

import lombok.Data;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;

@Data
public class CategoryResponse {
    private Long id;
    private String name;
    private String sizeChartUrl;
    private Boolean isActive;
    private OffsetDateTime deletedAt;
}