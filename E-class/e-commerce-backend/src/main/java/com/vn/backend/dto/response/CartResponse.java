package com.vn.backend.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class CartResponse {

    private Long cartId;
    private Long customerId;
    private String status;

    private List<CartItemResponse> items;

    private BigDecimal originalSubtotal;
    private BigDecimal productDiscountTotal;
    private BigDecimal subtotalBeforeVoucher;
    private BigDecimal totalAmount;
    private Integer totalItems;


}
