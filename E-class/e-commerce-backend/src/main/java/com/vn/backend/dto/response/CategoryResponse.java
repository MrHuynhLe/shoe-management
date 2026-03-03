package com.vn.backend.dto.response;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class CategoryResponse {
    private Long id;
    private String name;
    private String sizeChartUrl;
    private Boolean isActive;
    private LocalDateTime deletedAt;
}
