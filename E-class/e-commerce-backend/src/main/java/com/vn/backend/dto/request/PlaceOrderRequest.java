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
    private ShippingInfoRequest shippingInfo;

    @NotBlank
    private String paymentMethodCode;

    @NotEmpty
    private List<OrderItemRequest> items;

    private String voucherCode;

    private Long employeeId; 

}