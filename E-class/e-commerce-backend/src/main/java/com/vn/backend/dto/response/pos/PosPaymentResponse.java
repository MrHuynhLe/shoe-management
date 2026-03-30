package com.vn.backend.dto.response.pos;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class PosPaymentResponse {
    private Long paymentId;
    private Long paymentMethodId;
    private String paymentMethodName;
    private BigDecimal amount;
    private String status;
}