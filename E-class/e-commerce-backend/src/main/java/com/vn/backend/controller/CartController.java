package com.vn.backend.controller;

import com.vn.backend.dto.request.AddCartRequest;
import com.vn.backend.dto.response.CartResponse;
import com.vn.backend.dto.response.OrderResponse;
import com.vn.backend.security.JwtUtil;
import com.vn.backend.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/v1/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    // ===== LẤY USER ID TỪ JWT =====
    private Long getCurrentUserId() {
        return Long.parseLong(
                SecurityContextHolder.getContext()
                        .getAuthentication()
                        .getName()
        );
    }

    // ==============================
    // ADD ITEM
    // ==============================
    @PostMapping("/items")
    public ResponseEntity<CartResponse> addToCart(
            @RequestBody AddCartRequest request
    ) {
        Long userId = getCurrentUserId();
        return ResponseEntity.ok(cartService.addToCart(userId, request));
    }

    // ==============================
    // GET MY CART
    // ==============================
    @GetMapping
    public ResponseEntity<CartResponse> getCart() {
        Long userId = getCurrentUserId();
        return ResponseEntity.ok(cartService.getActiveCart(userId));
    }

    // ==============================
    // UPDATE QUANTITY
    // ==============================
    @PutMapping("/items/{cartItemId}")
    public ResponseEntity<CartResponse> updateQuantity(
            @PathVariable Long cartItemId,
            @RequestParam int quantity
    ) {
        Long userId = getCurrentUserId();
        return ResponseEntity.ok(
                cartService.updateQuantity(userId, cartItemId, quantity)
        );
    }

    // ==============================
    // REMOVE ITEM
    // ==============================
    @DeleteMapping("/items/{cartItemId}")
    public ResponseEntity<CartResponse> removeItem(
            @PathVariable Long cartItemId
    ) {
        Long userId = getCurrentUserId();
        return ResponseEntity.ok(
                cartService.removeItem(userId, cartItemId)
        );
    }

    // ==============================
    // CLEAR CART
    // ==============================
    @DeleteMapping
    public ResponseEntity<Void> clearCart() {
        Long userId = getCurrentUserId();
        cartService.clearCart(userId);
        return ResponseEntity.noContent().build();
    }

    // ==============================
    // CHECKOUT
    // ==============================
    @PostMapping("/checkout")
    public ResponseEntity<OrderResponse> checkout() {
        Long userId = getCurrentUserId();
        return ResponseEntity.ok(cartService.checkout(userId));
    }
}