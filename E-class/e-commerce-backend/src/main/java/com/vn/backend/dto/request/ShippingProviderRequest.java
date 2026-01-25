package com.vn.backend.dto.request;

import lombok.Data;

@Data
public class ShippingProviderRequest {
    private String code;
    private String name;
    private Boolean isActive = true;
}