package com.vn.backend.dto.request;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class VoucherApplyRequest {
    private String code;
    private BigDecimal orderAmount;
}
