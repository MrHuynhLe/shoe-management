package com.vn.backend.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class OrderResponse {
    private Long id;
    private String code;
    private BigDecimal discountAmount;
    private String voucherCode;
    private BigDecimal totalAmount;
    private String status;
    private OffsetDateTime createdAt;
    private CustomerResponse customer;
    private List<OrderItemResponse> items;
    private String customerName;
    private String phone;
    private String orderType; 
    private Long employeeId; 
    private String employeeName; 
}