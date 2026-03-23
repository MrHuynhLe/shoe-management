package com.vn.backend.dto.response;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class GhtkFeeResponse {
    private boolean success;
    private GhtkFeeData fee;
    private String message;

    @Data
    public static class GhtkFeeData {
        private BigDecimal fee;
        private BigDecimal insurance_fee;
        private BigDecimal transport_fee;
        private BigDecimal pick_money;
        private BigDecimal coupon_value;
        private BigDecimal delivery_fee;
    }
}