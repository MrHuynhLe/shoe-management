package com.vn.backend.dto.request.pos;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class PosCheckoutRequest {

    @NotNull(message = "Payment method id không được để trống")
    private Long paymentMethodId;

    @NotNull(message = "Tiền khách trả không được để trống")
    @DecimalMin(value = "0.0", inclusive = true, message = "Tiền khách trả phải >= 0")
    private BigDecimal customerPaid;

    private BigDecimal discountAmount;

    private String note;
}