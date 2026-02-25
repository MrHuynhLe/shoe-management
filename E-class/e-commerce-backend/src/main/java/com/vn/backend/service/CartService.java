package com.vn.backend.service;


import com.vn.backend.dto.request.AddCartRequest;
import com.vn.backend.dto.response.CartResponse;
import com.vn.backend.dto.response.OrderResponse;


public interface CartService {
    CartResponse addToCart(AddCartRequest request);
    CartResponse getActiveCart(Long customerId);
    CartResponse updateQuantity(Long cartItemId, int quantity);
    CartResponse removeItem(Long cartItemId);
    void clearCart(Long customerId);
    OrderResponse checkout(Long customerId);
}