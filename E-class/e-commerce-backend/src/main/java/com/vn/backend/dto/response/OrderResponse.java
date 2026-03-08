
package com.vn.backend.dto.response;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderResponse {
    private Long id;
    private String code;
    private BigDecimal discountAmount;
    private BigDecimal totalAmount;
    private String status;
    private OffsetDateTime createdAt;
    private List<OrderItemResponse> items;
    private CustomerResponse customer;
}