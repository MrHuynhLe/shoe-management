package com.vn.backend.service;

import com.vn.backend.dto.request.PlaceOrderRequest;
import com.vn.backend.dto.response.OrderDetailResponse;
import com.vn.backend.dto.response.OrderResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface OrderService {
    OrderResponse placeOrder(Long userId, PlaceOrderRequest request);
    OrderDetailResponse getOrderDetailsById(Long orderId, Long userId);
    Page<OrderResponse> getMyOrders(Long userId, Pageable pageable);
    Page<OrderResponse> getAllOrders(Pageable pageable);
    OrderResponse updateOrderStatus(Long orderId, String status);
}