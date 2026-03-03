
package com.vn.backend.dto.response;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class InventoryTransactionResponse {
    private Long id;
    private Long productVariantId;
    private String productVariantCode;
    private Long storeId;
    private String storeName;
    private String transactionType;
    private Integer quantity;
    private String reason;
    private String referenceCode;
    private LocalDateTime createdAt;
}
