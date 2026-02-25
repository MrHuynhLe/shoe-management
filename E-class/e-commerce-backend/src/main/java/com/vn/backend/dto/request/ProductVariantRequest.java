package com.vn.backend.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;
@Data
public class ProductVariantRequest {

    // ID sản phẩm đã tồn tại
    private Long productId;

    // Danh sách các biến thể
    private List<VariantItem> variants;

    @Data
    public static class VariantItem {
        private String color;
        private Integer size;
        private BigDecimal costPrice;
        private BigDecimal sellingPrice;
        private Integer stockQuantity;
        private String imageUrl;
    }
}