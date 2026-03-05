package com.vn.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class PaymentMethodRequest {

    @NotBlank(message = "Mã phương thức thanh toán không được để trống")
    private String code;

    @NotBlank(message = "Tên phương thức thanh toán không được để trống")
    private String name;

    @NotNull(message = "Trạng thái hoạt động không được để trống")
    private Boolean isActive;
}