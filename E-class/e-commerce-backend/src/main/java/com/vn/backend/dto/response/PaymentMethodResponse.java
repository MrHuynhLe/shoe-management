package com.vn.backend.dto.response;

import lombok.Data;

@Data
public class PaymentMethodResponse {
    private Long id;
    private String code;
    private String name;
    private Boolean isActive;
}