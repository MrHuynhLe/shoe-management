package com.vn.backend.dto.response.pos;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class PosOrderResponse {
    private Integer orderId;
    private String orderCode;
    private String status;
    private Integer customerId;
    private String customerName;
    private Integer employeeId;
    private Integer storeId;
    private Double totalAmount;
    private Double discountAmount;
    private Double finalAmount;
    private Double customerPaid;
    private Double changeAmount;
    private String orderType;
    private String note;
    private List<PosOrderItemResponse> items;
}