package com.vn.backend.dto.request;

import lombok.Data;

import java.util.List;

@Data
public class CreateOrderRequest {
    private Long customerId;
    private String shippingName;
    private String shippingPhone;
    private String shippingAddress;
    private String paymentMethod;
    private String note;
    private String voucherCode;

    private List<OrderItemRequest> items;

    @Data
    public static class OrderItemRequest {
        private Long productVariantId;
        private Integer quantity;
    }
}
