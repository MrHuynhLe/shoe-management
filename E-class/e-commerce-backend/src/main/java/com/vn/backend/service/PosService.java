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

    List<PosOrderResponse> getDraftOrders();

    PosOrderResponse getOrderDetail(Long orderId);

    List<PosProductSearchResponse> searchProducts(String keyword);

    PosProductSearchResponse getProductByBarcode(String barcode);

    PosOrderResponse addItem(Long orderId, PosAddItemRequest request);

    PosOrderResponse updateItem(Long orderId, Long itemId, PosUpdateItemRequest request);

    PosOrderResponse removeItem(Long orderId, Long itemId);

    PosOrderResponse assignCustomer(Long orderId, PosAssignCustomerRequest request);

    PosOrderResponse checkout(Long orderId, PosCheckoutRequest request);

    void cancelOrder(Long orderId);
}