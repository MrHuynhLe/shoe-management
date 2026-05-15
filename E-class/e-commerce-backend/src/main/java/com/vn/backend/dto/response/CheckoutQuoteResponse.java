package com.vn.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CheckoutQuoteResponse {
    private List<CheckoutQuoteItemResponse> items;
    private BigDecimal originalSubtotal;
    private BigDecimal productDiscountTotal;
    private BigDecimal subtotalBeforeVoucher;
    private BigDecimal voucherDiscountAmount;
    private BigDecimal shippingFee;
    private BigDecimal productRevenue;
    private BigDecimal finalTotal;
    private String voucherCode;
    private Boolean voucherValid;
    private String voucherMessage;
}
