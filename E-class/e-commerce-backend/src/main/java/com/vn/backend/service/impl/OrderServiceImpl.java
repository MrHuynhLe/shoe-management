package com.vn.backend.service.impl;

import com.vn.backend.dto.request.CreateOrderRequest;
import com.vn.backend.dto.request.UpdateOrderStatusRequest;
import com.vn.backend.dto.request.VoucherApplyRequest;
import com.vn.backend.dto.response.OrderDetailResponse;
import com.vn.backend.dto.response.OrderResponse;
import com.vn.backend.dto.response.PageResponse;
import com.vn.backend.dto.response.VoucherApplyResponse;
import com.vn.backend.entity.Customer;
import com.vn.backend.entity.Order;
import com.vn.backend.entity.OrderItem;
import com.vn.backend.entity.ProductVariant;
import com.vn.backend.enums.OrderStatus;
import com.vn.backend.mapper.OrderMapper;
import com.vn.backend.mapper.PageMapper;
import com.vn.backend.repository.CustomerRepository;
import com.vn.backend.repository.OrderRepository;
import com.vn.backend.repository.ProductVariantRepository;
import com.vn.backend.service.OrderService;
import com.vn.backend.service.PromotionService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final OrderMapper orderMapper;
    private final CustomerRepository customerRepository;
    private final ProductVariantRepository productVariantRepository;
    private final PromotionService promotionService;

    @Override
    @Transactional
    public OrderDetailResponse createOrder(CreateOrderRequest request) {
        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new RuntimeException("Customer not found: " + request.getCustomerId()));

        String code = "ORD-" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"))
                + String.format("%03d", (int) (Math.random() * 1000));

        BigDecimal subtotal = BigDecimal.ZERO;
        List<OrderItem> orderItems = new ArrayList<>();

        for (CreateOrderRequest.OrderItemRequest itemReq : request.getItems()) {
            ProductVariant variant = productVariantRepository.findActiveById(itemReq.getProductVariantId())
                    .orElseThrow(() -> new RuntimeException("Product variant not found: " + itemReq.getProductVariantId()));

            BigDecimal unitPrice = variant.getSellingPrice();
            BigDecimal lineTotal = unitPrice.multiply(BigDecimal.valueOf(itemReq.getQuantity()));

            String variantInfo = "";
            if (variant.getVariantAttributeValues() != null) {
                variantInfo = variant.getVariantAttributeValues().stream()
                        .map(av -> av.getAttributeValue().getAttribute().getCode()
                                + ": " + av.getAttributeValue().getValue())
                        .collect(Collectors.joining(", "));
            }

            String imageUrl = null;
            if (variant.getProduct() != null
                    && variant.getProduct().getImages() != null
                    && !variant.getProduct().getImages().isEmpty()) {
                imageUrl = variant.getProduct().getImages().get(0).getImageUrl();
            }

            OrderItem orderItem = OrderItem.builder()
                    .productVariant(variant)
                    .productName(variant.getProduct().getName())
                    .variantInfo(variantInfo)
                    .imageUrl(imageUrl)
                    .quantity(itemReq.getQuantity())
                    .unitPrice(unitPrice)
                    .totalPrice(lineTotal)
                    .build();

            orderItems.add(orderItem);
            subtotal = subtotal.add(lineTotal);
        }

        BigDecimal discountAmount = BigDecimal.ZERO;
        String voucherCode = null;
        String voucherName = null;

        if (request.getVoucherCode() != null && !request.getVoucherCode().isBlank()) {
            VoucherApplyRequest voucherReq = new VoucherApplyRequest();
            voucherReq.setCode(request.getVoucherCode());
            voucherReq.setOrderAmount(subtotal);

            VoucherApplyResponse voucherResp = promotionService.applyVoucher(voucherReq);
            if (!voucherResp.isValid()) {
                throw new RuntimeException(voucherResp.getMessage());
            }

            discountAmount = voucherResp.getDiscountAmount();
            voucherCode = voucherResp.getVoucherCode();
            voucherName = voucherResp.getVoucherName();

            promotionService.consumeVoucher(request.getVoucherCode());
        }

        BigDecimal totalAmount = subtotal.subtract(discountAmount);
        if (totalAmount.compareTo(BigDecimal.ZERO) < 0) {
            totalAmount = BigDecimal.ZERO;
        }

        Order order = Order.builder()
                .code(code)
                .customer(customer)
                .shippingName(request.getShippingName())
                .shippingPhone(request.getShippingPhone())
                .shippingAddress(request.getShippingAddress())
                .paymentMethod(request.getPaymentMethod())
                .note(request.getNote())
                .voucherCode(voucherCode)
                .voucherName(voucherName)
                .discountAmount(discountAmount)
                .totalAmount(totalAmount)
                .status(OrderStatus.PENDING.name())
                .build();

        for (OrderItem item : orderItems) {
            item.setOrder(order);
        }
        order.setOrderItems(orderItems);

        orderRepository.save(order);

        return orderMapper.toOrderDetailResponse(order);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<OrderResponse> getAllOrders(int page, int size, String status) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Order> orders;

        if (status != null && !status.isEmpty()) {
            orders = orderRepository.findByStatusOrderByCreatedAtDesc(status, pageable);
        } else {
            orders = orderRepository.findAllByOrderByCreatedAtDesc(pageable);
        }

        return PageMapper.toPageResponse(orders, orderMapper::toOrderResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public OrderDetailResponse getOrderDetail(Long id) {
        Order order = orderRepository.findWithDetailsById(id)
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + id));
        return orderMapper.toOrderDetailResponse(order);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<OrderDetailResponse> getOrdersByCustomer(Long customerId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Order> orders = orderRepository.findByCustomer_IdOrderByCreatedAtDesc(customerId, pageable);
        return PageMapper.toPageResponse(orders, orderMapper::toOrderDetailResponse);
    }

    @Override
    @Transactional
    public OrderResponse updateOrderStatus(Long id, UpdateOrderStatusRequest request) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + id));

        // Validate status
        try {
            OrderStatus.valueOf(request.getStatus());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid order status: " + request.getStatus());
        }

        order.setStatus(request.getStatus());
        order.setUpdatedAt(LocalDateTime.now());
        Order saved = orderRepository.save(order);
        return orderMapper.toOrderResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<OrderResponse> searchOrders(String keyword, String status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        String searchStatus = (status != null && !status.isEmpty()) ? status : null;
        String searchKeyword = (keyword != null && !keyword.isEmpty()) ? keyword : null;
        Page<Order> orders = orderRepository.searchOrders(searchKeyword, searchStatus, pageable);
        return PageMapper.toPageResponse(orders, orderMapper::toOrderResponse);
    }
}
