package com.vn.backend.dto.response.pos;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PosVnpayReturnResponse {
    private boolean success;
    private String message;
    private String txnRef;
    private String transactionNo;
    private String responseCode;
    private Long orderId;
}