package com.vn.backend.dto.request;

import lombok.Data;

@Data
public class InventoryTransactionRequest {
    private Long productVariantId;
    private Long storeId;
    private String transactionType;
    private Integer quantity;
    private String reason;
    private String referenceCode;
}