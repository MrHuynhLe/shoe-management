package com.vn.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VoucherApplyResponse {
    private boolean valid;
    private String voucherCode;
    private String voucherName;
    private String discountType;
    private BigDecimal discountAmount;
    private String message;
}
