package com.vn.backend.dto.response;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ShippingProviderResponse {
    private Long id;
    private String code;
    private String name;
    private Boolean isActive;
    private LocalDateTime createdAt;
}