
package com.vn.backend.service;

import com.vn.backend.dto.request.InventoryTransactionRequest;
import com.vn.backend.dto.response.InventoryTransactionResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;


public interface InventoryTransactionService {
    Page<InventoryTransactionResponse> getAllTransactions(Pageable pageable);
    InventoryTransactionResponse getTransactionById(Long id);
    InventoryTransactionResponse createTransaction(InventoryTransactionRequest request);
    Page<InventoryTransactionResponse> getTransactionsByVariant(Long variantId, Pageable pageable);
    Page<InventoryTransactionResponse> getTransactionsByStore(Long storeId, Pageable pageable);
}
