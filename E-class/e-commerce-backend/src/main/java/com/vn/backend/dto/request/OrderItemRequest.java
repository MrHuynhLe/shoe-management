package com.vn.backend.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class OrderItemRequest {
    @NotNull
    private Long variantId;

    @NotNull
    @Min(1)
    private Integer quantity;
}