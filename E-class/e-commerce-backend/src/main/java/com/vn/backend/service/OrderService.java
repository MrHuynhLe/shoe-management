package com.vn.backend.service;

import com.vn.backend.dto.request.CreateOrderRequest;
import com.vn.backend.dto.request.UpdateOrderStatusRequest;
import com.vn.backend.dto.response.OrderDetailResponse;
import com.vn.backend.dto.response.OrderResponse;
import com.vn.backend.dto.response.PageResponse;

public interface OrderService {

    OrderDetailResponse createOrder(CreateOrderRequest request);

    PageResponse<OrderResponse> getAllOrders(int page, int size, String status);

    OrderDetailResponse getOrderDetail(Long id);

    PageResponse<OrderDetailResponse> getOrdersByCustomer(Long customerId, int page, int size);

    OrderResponse updateOrderStatus(Long id, UpdateOrderStatusRequest request);

    PageResponse<OrderResponse> searchOrders(String keyword, String status, int page, int size);
}
