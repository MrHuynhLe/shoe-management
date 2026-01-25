package com.vn.backend.dto.response;

import lombok.Data;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;

@Data
public class BrandResponse {
    private Long id;
    private String name;
    private Boolean isActive;
    private OffsetDateTime deletedAt;
}