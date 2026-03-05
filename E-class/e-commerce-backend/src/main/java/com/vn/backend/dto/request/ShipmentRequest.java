package com.vn.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class ShipmentRequest {

    @NotNull(message = "ID đơn hàng không được để trống")
    private Long orderId;

    @NotNull(message = "ID nhà cung cấp vận chuyển không được để trống")
    private Long shippingProviderId;

    private String trackingCode;

    private BigDecimal shippingFee;

    @NotBlank(message = "Trạng thái không được để trống")
    private String status;
}