package com.vn.backend.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.OffsetDateTime;

@Data
@Builder
public class OrderStatusHistoryResponse {
    private Long id;
    private Long orderId;
    private String fromStatus;
    private String toStatus;
    private OffsetDateTime changedAt;
}