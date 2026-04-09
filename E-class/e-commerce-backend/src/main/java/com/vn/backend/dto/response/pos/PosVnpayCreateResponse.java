package com.vn.backend.dto.response.pos;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PosVnpayCreateResponse {
    private Long orderId;
    private String orderCode;
    private String paymentUrl;
    private String txnRef;
}