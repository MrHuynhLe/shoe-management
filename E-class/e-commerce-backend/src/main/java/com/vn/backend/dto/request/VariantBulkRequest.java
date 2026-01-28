package com.vn.backend.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class VariantBulkRequest {
    @NotNull(message = "ID sản phẩm không được rỗng")
    private Long productId;

    @NotEmpty(message = "Danh sách biến thể không được rỗng")
    @Valid
    private List<VariantItemRequest> variants;

    @Data
    public static class VariantItemRequest {
        @NotBlank(message = "SKU không được để trống")
        private String code;

        private BigDecimal costPrice;
        private BigDecimal sellingPrice;
        private Integer stockQuantity;
        private String imageUrl;
        @NotEmpty(message = "Mỗi biến thể phải có ít nhất 1 thuộc tính")
        private List<Integer> attributeValueIds;
    }
}