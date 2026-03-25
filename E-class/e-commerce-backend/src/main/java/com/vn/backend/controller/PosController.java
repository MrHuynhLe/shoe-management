package com.vn.backend.controller;

import com.vn.backend.dto.request.pos.PosAddItemRequest;
import com.vn.backend.dto.request.pos.PosAssignCustomerRequest;
import com.vn.backend.dto.request.pos.PosCheckoutRequest;
import com.vn.backend.dto.request.pos.PosCreateOrderRequest;
import com.vn.backend.dto.request.pos.PosUpdateItemRequest;
import com.vn.backend.dto.response.pos.PosOrderResponse;
import com.vn.backend.dto.response.pos.PosProductSearchResponse;
import com.vn.backend.service.PosService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/v1/pos")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class PosController {

    private final PosService posService;

    @PostMapping("/orders")
    public ResponseEntity<PosOrderResponse> createOrder(@Valid @RequestBody PosCreateOrderRequest request) {
        return ResponseEntity.ok(posService.createOrder(request));
    }

    @GetMapping("/orders/{orderId}")
    public ResponseEntity<PosOrderResponse> getOrder(@PathVariable Long orderId) {
        return ResponseEntity.ok(posService.getOrder(orderId));
    }

    @GetMapping("/orders/drafts")
    public ResponseEntity<List<PosOrderResponse>> getDraftOrders() {
        return ResponseEntity.ok(posService.getDraftOrders());
    }

    @PostMapping("/orders/{orderId}/items")
    public ResponseEntity<PosOrderResponse> addItem(
            @PathVariable Long orderId,
            @Valid @RequestBody PosAddItemRequest request
    ) {
        return ResponseEntity.ok(posService.addItem(orderId, request));
    }

    @PostMapping("/orders/{orderId}/items/{variantId}")
    public ResponseEntity<PosOrderResponse> addItemQuick(
            @PathVariable Long orderId,
            @PathVariable Long variantId
    ) {
        return ResponseEntity.ok(posService.addItem(orderId, variantId));
    }

    @PutMapping("/orders/items/{itemId}")
    public ResponseEntity<PosOrderResponse> updateItem(
            @PathVariable Long itemId,
            @Valid @RequestBody PosUpdateItemRequest request
    ) {
        return ResponseEntity.ok(posService.updateItem(itemId, request));
    }

    @DeleteMapping("/orders/items/{itemId}")
    public ResponseEntity<Void> removeItem(@PathVariable Long itemId) {
        posService.removeItem(itemId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/orders/{orderId}/customer")
    public ResponseEntity<PosOrderResponse> assignCustomer(
            @PathVariable Long orderId,
            @RequestBody PosAssignCustomerRequest request
    ) {
        return ResponseEntity.ok(posService.assignCustomer(orderId, request));
    }

    @PostMapping("/orders/{orderId}/checkout")
    public ResponseEntity<PosOrderResponse> checkout(
            @PathVariable Long orderId,
            @Valid @RequestBody PosCheckoutRequest request
    ) {
        return ResponseEntity.ok(posService.checkout(orderId, request));
    }

    @PostMapping("/orders/{orderId}/cancel")
    public ResponseEntity<PosOrderResponse> cancel(@PathVariable Long orderId) {
        return ResponseEntity.ok(posService.cancel(orderId));
    }

    @GetMapping("/products/search")
    public ResponseEntity<List<PosProductSearchResponse>> searchProducts(@RequestParam String keyword) {
        return ResponseEntity.ok(posService.searchProducts(keyword));
    }
}