package com.vn.backend.dto.response;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class BrandResponse {
    private Long id;
    private String name;
    private Boolean isActive;
    private LocalDateTime deletedAt;
}
