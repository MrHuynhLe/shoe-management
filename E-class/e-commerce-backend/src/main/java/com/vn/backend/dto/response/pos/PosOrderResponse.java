package com.vn.backend.dto.response.pos;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
public class PosOrderResponse {
    private Long orderId;
    private String orderCode;
    private String status;
    private Long customerId;
    private String customerName;
    private Long employeeId;
    private Long storeId;
    private BigDecimal totalAmount;
    private BigDecimal discountAmount;
    private String voucherCode;
    private BigDecimal finalAmount;
    private BigDecimal customerPaid;
    private BigDecimal changeAmount;
    private String orderType;
    private String note;
    private List<PosOrderItemResponse> items;
}