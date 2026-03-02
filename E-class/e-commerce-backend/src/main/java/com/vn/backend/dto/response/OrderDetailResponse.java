package com.vn.backend.dto.response;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderDetailResponse {
    private Long id;
    private String code;

    private String customerName;
    private String customerPhone;
    private String customerAddress;

    private String shippingName;
    private String shippingPhone;
    private String shippingAddress;

    private List<OrderItemResponse> items;
    private BigDecimal totalAmount;
    private BigDecimal discountAmount;
    private String voucherCode;
    private String voucherName;
    private String status;
    private String paymentMethod;
    private String note;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
