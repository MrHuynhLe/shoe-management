
package com.vn.backend.dto.response;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderResponse {
    public String b;
    private Long id;
    private String code;
    private BigDecimal totalAmount;
    private LocalDateTime createdAt;
}