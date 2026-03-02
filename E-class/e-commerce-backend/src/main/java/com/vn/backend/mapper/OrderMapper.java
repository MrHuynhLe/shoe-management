package com.vn.backend.mapper;

import com.vn.backend.dto.response.OrderDetailResponse;
import com.vn.backend.dto.response.OrderItemResponse;
import com.vn.backend.dto.response.OrderResponse;
import com.vn.backend.entity.Order;
import com.vn.backend.entity.OrderItem;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class OrderMapper {

    public OrderResponse toOrderResponse(Order order) {
        String customerName = "";
        String customerPhone = "";
        if (order.getCustomer() != null && order.getCustomer().getUserProfile() != null) {
            customerName = order.getCustomer().getUserProfile().getFullName();
            customerPhone = order.getCustomer().getUserProfile().getPhone();
        }

        return OrderResponse.builder()
                .id(order.getId())
                .code(order.getCode())
                .customerName(customerName)
                .customerPhone(customerPhone)
                .totalAmount(order.getTotalAmount())
                .discountAmount(order.getDiscountAmount())
                .voucherCode(order.getVoucherCode())
                .status(order.getStatus())
                .itemCount(order.getOrderItems() != null ? order.getOrderItems().size() : 0)
                .paymentMethod(order.getPaymentMethod())
                .createdAt(order.getCreatedAt())
                .build();
    }

    public OrderDetailResponse toOrderDetailResponse(Order order) {
        String customerName = "";
        String customerPhone = "";
        String customerAddress = "";
        if (order.getCustomer() != null && order.getCustomer().getUserProfile() != null) {
            customerName = order.getCustomer().getUserProfile().getFullName();
            customerPhone = order.getCustomer().getUserProfile().getPhone();
            customerAddress = order.getCustomer().getUserProfile().getAddress();
        }

        List<OrderItemResponse> items = order.getOrderItems() != null
                ? order.getOrderItems().stream().map(this::toOrderItemResponse).collect(Collectors.toList())
                : List.of();

        return OrderDetailResponse.builder()
                .id(order.getId())
                .code(order.getCode())
                .customerName(customerName)
                .customerPhone(customerPhone)
                .customerAddress(customerAddress)
                .shippingName(order.getShippingName())
                .shippingPhone(order.getShippingPhone())
                .shippingAddress(order.getShippingAddress())
                .items(items)
                .totalAmount(order.getTotalAmount())
                .discountAmount(order.getDiscountAmount())
                .voucherCode(order.getVoucherCode())
                .voucherName(order.getVoucherName())
                .status(order.getStatus())
                .paymentMethod(order.getPaymentMethod())
                .note(order.getNote())
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .build();
    }

    public OrderItemResponse toOrderItemResponse(OrderItem item) {
        return OrderItemResponse.builder()
                .id(item.getId())
                .productVariantId(item.getProductVariant() != null ? item.getProductVariant().getId() : null)
                .productName(item.getProductName())
                .variantInfo(item.getVariantInfo())
                .imageUrl(item.getImageUrl())
                .quantity(item.getQuantity())
                .unitPrice(item.getUnitPrice())
                .totalPrice(item.getTotalPrice())
                .build();
    }
}
