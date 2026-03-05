package com.vn.backend.dto.response;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class PaymentResponse {
    private Long id;
    private Long orderId;
    private String paymentMethodName;
    private BigDecimal amount;
    private String status;
    private LocalDateTime createdAt;
}