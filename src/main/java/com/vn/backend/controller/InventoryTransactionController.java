package com.vn.backend.controller;

import com.vn.backend.dto.request.InventoryTransactionRequest;
import com.vn.backend.dto.response.InventoryTransactionResponse;
import com.vn.backend.service.InventoryTransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/v1/inventory-transactions")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class InventoryTransactionController {

    private final InventoryTransactionService inventoryTransactionService;

    @GetMapping
    public ResponseEntity<Page<InventoryTransactionResponse>> getAllTransactions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<InventoryTransactionResponse> transactions = inventoryTransactionService.getAllTransactions(pageable);
        return ResponseEntity.ok(transactions);
    }

    @GetMapping("/{id}")
    public ResponseEntity<InventoryTransactionResponse> getTransactionById(@PathVariable Long id) {
        InventoryTransactionResponse transaction = inventoryTransactionService.getTransactionById(id);
        return ResponseEntity.ok(transaction);
    }

    @GetMapping("/variant/{variantId}")
    public ResponseEntity<Page<InventoryTransactionResponse>> getTransactionsByVariant(
            @PathVariable Long variantId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<InventoryTransactionResponse> transactions =
                inventoryTransactionService.getTransactionsByVariant(variantId, pageable);
        return ResponseEntity.ok(transactions);
    }

    @GetMapping("/store/{storeId}")
    public ResponseEntity<Page<InventoryTransactionResponse>> getTransactionsByStore(
            @PathVariable Long storeId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<InventoryTransactionResponse> transactions =
                inventoryTransactionService.getTransactionsByStore(storeId, pageable);
        return ResponseEntity.ok(transactions);
    }

    @PostMapping
    public ResponseEntity<InventoryTransactionResponse> createTransaction(@RequestBody InventoryTransactionRequest request) {
        InventoryTransactionResponse transaction = inventoryTransactionService.createTransaction(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(transaction);
    }
}