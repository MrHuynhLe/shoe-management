package com.vn.backend.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

@Data
public class CheckoutQuoteRequest {

    @NotEmpty
    @Valid
    private List<OrderItemRequest> items;

    private String voucherCode;

    @Valid
    private ShippingInfoRequest shippingInfo;
}
