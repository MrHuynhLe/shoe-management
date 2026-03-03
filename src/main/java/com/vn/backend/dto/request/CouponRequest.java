package com.vn.backend.dto.request;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class CouponRequest {
    //dto
    private String code;
    private String discountType; // PERCENTAGE, FIXED_AMOUNT
    private BigDecimal discountValue;
    private Integer usageLimit;
    private LocalDateTime endDate;
    private Boolean isActive = true;
}
