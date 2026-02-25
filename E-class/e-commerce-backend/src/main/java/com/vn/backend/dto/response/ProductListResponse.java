package com.vn.backend.dto.response;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@AllArgsConstructor
public class ProductListResponse {

    private Long id;
    private String code;
    private String name;
    private String brandName;
    private String categoryName;
    private BigDecimal minPrice;
    private BigDecimal maxPrice;
    private Long totalStock;
    private String imageUrl;
}

