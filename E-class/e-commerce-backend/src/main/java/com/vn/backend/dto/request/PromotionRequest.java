package com.vn.backend.dto.request;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class PromotionRequest {
    private String code;
    private String name;
    private String description;
    private String discountType;
    private BigDecimal discountValue;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private Boolean isActive = true;
}