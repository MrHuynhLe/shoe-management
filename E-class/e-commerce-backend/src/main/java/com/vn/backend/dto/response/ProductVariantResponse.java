package com.vn.backend.dto.response;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter @Setter
public class ProductVariantResponse {
    private Long id;
    private Long productId;
    private String productName;
    private String code;
    private String barcode;
    private BigDecimal costPrice;
    private BigDecimal sellingPrice;
    private Integer stockQuantity;
    private String binLocation;
    private Boolean isActive;
    private LocalDateTime deletedAt;
    // Attributes like [{attribute: "Size", value: "42"}, {attribute: "Color", value: "Đỏ"}]
    private List<AttributeValueInfo> attributes;

    @Getter @Setter
    public static class AttributeValueInfo {
        private Long attributeValueId;
        private Long attributeId;
        private String attributeCode;
        private String attributeName;
        private String value;
    }
}
