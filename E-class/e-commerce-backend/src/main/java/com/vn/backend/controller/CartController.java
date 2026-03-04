package com.vn.backend.controller;

import com.vn.backend.dto.request.AddCartRequest;
import com.vn.backend.dto.response.CartResponse;
import com.vn.backend.dto.response.OrderResponse;
import com.vn.backend.entity.User;
import com.vn.backend.repository.UserRepository;
import com.vn.backend.security.CustomUserDetails;
import com.vn.backend.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
@RestController
@RequestMapping("/v1/cart")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @PostMapping("/items")
    public ResponseEntity<CartResponse> addToCart(
            @RequestBody AddCartRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        System.out.println("UserDetails: " + userDetails);
        return ResponseEntity.ok(
                cartService.addToCart(userDetails.getUserId(), request)
        );
    }

    @GetMapping
    public ResponseEntity<CartResponse> getCart(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        return ResponseEntity.ok(
                cartService.getActiveCart(userDetails.getUserId())
        );
    }

    @PutMapping("/items/{cartItemId}")
    public ResponseEntity<CartResponse> updateQuantity(
            @PathVariable Long cartItemId,
            @RequestParam int quantity,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        return ResponseEntity.ok(
                cartService.updateQuantity(
                        userDetails.getUserId(),
                        cartItemId,
                        quantity
                )
        );
    }

    @DeleteMapping("/items/{cartItemId}")
    public ResponseEntity<CartResponse> removeItem(
            @PathVariable Long cartItemId,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        return ResponseEntity.ok(
                cartService.removeItem(userDetails.getUserId(), cartItemId)
        );
    }

    @DeleteMapping
    public ResponseEntity<Void> clearCart(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        cartService.clearCart(userDetails.getUserId());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/checkout")
    public ResponseEntity<OrderResponse> checkout(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        return ResponseEntity.ok(
                cartService.checkout(userDetails.getUserId())
        );
    }
}