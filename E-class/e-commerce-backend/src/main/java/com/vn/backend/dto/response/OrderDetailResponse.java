package com.vn.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderDetailResponse {
    private Long id;
    private String code;
    private OffsetDateTime createdAt;
    private String status;
    private String customerName;
    private String phone;
    private String address;

    private String paymentMethodName;
    private BigDecimal totalAmount;
    private String voucherCode;
    private BigDecimal discountAmount;
    private BigDecimal shippingFee;

    private List<OrderItemResponse> items;
}