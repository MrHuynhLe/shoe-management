package com.vn.backend.dto.request.pos;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class PosCheckoutRequest {

    @NotNull(message = "paymentMethodId không được để trống")
    private Integer paymentMethodId;

    @NotNull(message = "customerPaid không được để trống")
    @DecimalMin(value = "0.0", inclusive = true, message = "customerPaid phải lớn hơn hoặc bằng 0")
    private Double customerPaid;

    private String note;
}