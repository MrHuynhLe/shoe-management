package com.vn.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class ProductVariantCreateRequest {

    @NotNull(message = "ProductId không được để trống")
    private Long productId;

    @NotBlank(message = "Mã biến thể không được để trống")
    private String code;

    private String barcode;

    @NotNull(message = "Giá nhập không được để trống")
    private BigDecimal costPrice;

    @NotNull(message = "Giá bán không được để trống")
    private BigDecimal sellingPrice;

    private Integer stockQuantity;

    private String binLocation;

    private Boolean isActive;

    @NotEmpty(message = "Biến thể phải có ít nhất 1 thuộc tính")
    private List<Long> attributeValueIds;
}