package com.vn.backend.dto.response;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class ShipmentResponse {
    private Long id;
    private Long orderId;
    private String shippingProviderName;
    private String trackingCode;
    private BigDecimal shippingFee;
    private String status;
    private LocalDateTime createdAt;
}