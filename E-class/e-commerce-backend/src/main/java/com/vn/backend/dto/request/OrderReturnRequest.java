package com.vn.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class OrderReturnRequest {

    @NotBlank(message = "Lý do trả hàng không được để trống")
    private String reason;
}