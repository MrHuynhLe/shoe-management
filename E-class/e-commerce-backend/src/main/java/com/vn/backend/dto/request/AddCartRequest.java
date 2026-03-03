package com.vn.backend.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AddCartRequest {

    @NotNull(message = "CustomerId is required")
    private Long customerId;

    @NotNull(message = "ProductVariantId is required")
    private Long productVariantId;

    @Min(value = 1, message = "Quantity must be greater than 0")
    private Integer quantity;
}