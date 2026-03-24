package com.vn.backend.dto.request.pos;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class PosCreateOrderRequest {

    @NotNull(message = "employeeId không được để trống")
    private Integer employeeId;

    private Integer customerId;

    @NotNull(message = "storeId không được để trống")
    private Integer storeId;

    private String note;
}