package com.vn.backend.dto.request;

import lombok.Data;

@Data
public class UpdateCartRequest{
    private Long variantId;
    private int qty;
}
