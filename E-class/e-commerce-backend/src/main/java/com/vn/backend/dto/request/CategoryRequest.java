package com.vn.backend.dto.request;

import lombok.Data;

@Data
public class CategoryRequest {
    private String name;
    private String sizeChartUrl;
    private Boolean isActive = true;
}