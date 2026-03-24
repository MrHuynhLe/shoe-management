package com.vn.backend.service;

import com.vn.backend.dto.request.pos.PosAddItemRequest;
import com.vn.backend.dto.request.pos.PosAssignCustomerRequest;
import com.vn.backend.dto.request.pos.PosCheckoutRequest;
import com.vn.backend.dto.request.pos.PosCreateOrderRequest;
import com.vn.backend.dto.request.pos.PosUpdateItemRequest;
import com.vn.backend.dto.response.pos.PosOrderResponse;
import com.vn.backend.dto.response.pos.PosProductSearchResponse;

import java.util.List;

public interface PosService {

    PosOrderResponse createOrder(PosCreateOrderRequest request);

    PosOrderResponse getOrder(Long orderId);

    List<PosOrderResponse> getDraftOrders();

    PosOrderResponse addItem(Long orderId, PosAddItemRequest request);

    PosOrderResponse addItem(Long orderId, Long variantId);

    PosOrderResponse updateItem(Long itemId, PosUpdateItemRequest request);

    void removeItem(Long itemId);

    PosOrderResponse assignCustomer(Long orderId, PosAssignCustomerRequest request);

    PosOrderResponse checkout(Long orderId, PosCheckoutRequest request);

    PosOrderResponse cancel(Long orderId);

    List<PosProductSearchResponse> searchProducts(String keyword);
}