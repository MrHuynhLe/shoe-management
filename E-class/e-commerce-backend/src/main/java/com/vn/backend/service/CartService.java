package com.vn.backend.service;

import com.vn.backend.dto.request.AddCartRequest;
import com.vn.backend.dto.response.CartResponse;

public interface CartService {
    CartResponse addToCart(Long userId, AddCartRequest request);
    CartResponse getActiveCart(Long userId);
    CartResponse updateQuantity(Long userId, Long cartItemId, int quantity);
    CartResponse removeItem(Long userId, Long cartItemId);
    void clearCart(Long userId);
}