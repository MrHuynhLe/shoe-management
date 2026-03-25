package com.vn.backend.dto.request.pos;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class PosAddItemRequest {

    @NotNull(message = "productVariantId không được để trống")
    private Long productVariantId;

    @NotNull(message = "quantity không được để trống")
    @Min(value = 1, message = "quantity phải lớn hơn 0")
    private Integer quantity;
}