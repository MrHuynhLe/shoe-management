package com.vn.backend.dto.request;

import lombok.Data;

@Data
public class AddCartRequest {
    private Long customerId;
    private Long productVariantId;
    private int quantity;
}