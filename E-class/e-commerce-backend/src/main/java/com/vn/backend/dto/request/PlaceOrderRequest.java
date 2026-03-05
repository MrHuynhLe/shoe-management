package com.vn.backend.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class PlaceOrderRequest {

    @NotNull
    @Valid
    private ShippingInfo shippingInfo;

    @NotBlank
    private String paymentMethodCode;

    @NotEmpty
    private List<OrderItemRequest> items;

    private String voucherCode;

    private Long employeeId; // For POS orders

    @Data
    public static class ShippingInfo {
        @NotBlank private String customerName;
        @NotBlank private String phone;
        @NotBlank private String address;
        private String note;
    }

    @Data
    public static class OrderItemRequest {
        @NotNull private Long variantId;
        @NotNull @Min(1) private Integer quantity;
    }
}