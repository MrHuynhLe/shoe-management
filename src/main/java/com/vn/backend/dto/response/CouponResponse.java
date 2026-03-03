package com.vn.backend.dto.response;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class CouponResponse {
    private Long id;
    private String code;
    private String discountType;
    private BigDecimal discountValue;
    private Integer usageLimit;
    private Integer usedCount;
    private LocalDateTime endDate;
    private Boolean isActive;
    // check
    private Boolean isExpired;   // endDate != null && endDate < now
    private Boolean isUsedUp;    // usedCount >= usageLimit
    private Boolean isValid;     // isActive && !isExpired && !isUsedUp
}
