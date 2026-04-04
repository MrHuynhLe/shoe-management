package com.vn.backend.dto.response;

import lombok.Data;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Data
public class PromotionResponse {
    private Long id;
    private String code;
    private String name;
    private String discountType;
    private BigDecimal discountValue;
    private BigDecimal minOrderValue;
    private BigDecimal maxDiscountAmount;
    private Integer usageLimit;
    private Integer usageLimitPerCustomer;
    private OffsetDateTime startDate;
    private OffsetDateTime endDate;
    private Boolean isActive;
    private OffsetDateTime createdAt;

    // ====== thêm cho admin table ======
    private Integer issuedQuantity;     // số lượng phát hành
    private Long usedCount;             // số lượt đã dùng
    private Integer remainingCount;     // số lượng còn lại
    private Double usedPercent;         // % đã dùng
    private Double remainingPercent;    // % còn lại
}