package com.vn.backend.dto.request.pos;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class PosQuickCreateCustomerRequest {

    @NotBlank(message = "Tên khách hàng không được để trống")
    private String fullName;

    @NotBlank(message = "Số điện thoại không được để trống")
    private String phone;

    private String address;
}