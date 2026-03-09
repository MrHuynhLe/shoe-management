package com.vn.backend.service.impl;

import com.vn.backend.dto.request.PlaceOrderRequest;
import com.vn.backend.dto.request.ValidateDiscountRequest;
import com.vn.backend.dto.response.CustomerResponse;
import com.vn.backend.dto.response.UserProfileResponse;
import com.vn.backend.dto.response.OrderResponse;
import com.vn.backend.dto.response.OrderDetailResponse;
import com.vn.backend.dto.response.ValidateDiscountResponse;
import com.vn.backend.entity.*;
import com.vn.backend.exception.InvalidRequestException;
import com.vn.backend.dto.response.OrderItemResponse;
import com.vn.backend.exception.ResourceNotFoundException;
import com.vn.backend.repository.*;
import com.vn.backend.security.CustomUserDetails;
import com.vn.backend.service.DiscountService;
import com.vn.backend.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final ProductVariantRepository productVariantRepository;
    private final CustomerRepository customerRepository;
    private final UserRepository userRepository;
    private final CartItemRepository cartItemRepository;
    private final DiscountService discountService;
    private final PaymentMethodRepository paymentMethodRepository;
    private final PaymentRepository paymentRepository;
    private final EmployeeRepository employeeRepository;

    @Override
    @Transactional
    public OrderResponse placeOrder(Long userId, PlaceOrderRequest request) {
        Customer customer = resolveCustomer(userId);

        BigDecimal subTotal = BigDecimal.ZERO;
        List<OrderItem> orderItems = new ArrayList<>();
        List<Long> requestedVariantIds = request.getItems().stream().map(PlaceOrderRequest.OrderItemRequest::getVariantId).toList();
        Map<Long, ProductVariant> variantsMap = productVariantRepository.findAllById(requestedVariantIds)
                .stream().collect(Collectors.toMap(ProductVariant::getId, v -> v));

        for (PlaceOrderRequest.OrderItemRequest itemRequest : request.getItems()) {
            ProductVariant variant = variantsMap.get(itemRequest.getVariantId());
            if (variant == null) {
                throw new ResourceNotFoundException("Product variant not found with id: " + itemRequest.getVariantId());
            }
            if (variant.getStockQuantity() < itemRequest.getQuantity()) {
                throw new InvalidRequestException("Not enough stock for product: " + variant.getProduct().getName());
            }

            BigDecimal itemSubTotal = variant.getSellingPrice().multiply(BigDecimal.valueOf(itemRequest.getQuantity()));
            subTotal = subTotal.add(itemSubTotal);

            OrderItem orderItem = OrderItem.builder()
                    .productVariant(variant)
                    .quantity(itemRequest.getQuantity())
                    .costPriceAtPurchase(variant.getCostPrice())
                    .priceAtPurchase(variant.getSellingPrice())
                    .build();
            orderItems.add(orderItem);
        }

        BigDecimal discountAmount = BigDecimal.ZERO;
        if (StringUtils.hasText(request.getVoucherCode())) {
            ValidateDiscountRequest discountRequest = new ValidateDiscountRequest();
            discountRequest.setCode(request.getVoucherCode());
            discountRequest.setSubtotal(subTotal);

            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();

            ValidateDiscountResponse discountResponse = discountService.validateDiscount(discountRequest, userDetails);
            discountAmount = discountResponse.getDiscountAmount();
        }


        BigDecimal shippingFee = new BigDecimal("30000");
        BigDecimal totalAmount = subTotal.add(shippingFee).subtract(discountAmount);

        Employee employee = null;
        if (request.getEmployeeId() != null) {
            employee = employeeRepository.findById(request.getEmployeeId()).orElse(null);
        }

        Order order = Order.builder()
                .code("ORD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .customer(customer)
                .employee(employee)
                .status("PENDING")
                .discountAmount(discountAmount)
                .totalAmount(totalAmount)
                .build();

        for (OrderItem item : orderItems) {
            item.setOrder(order);
        }
        order.setItems(orderItems);

        Order savedOrder = orderRepository.save(order);
        PaymentMethod paymentMethod = paymentMethodRepository.findByCode(request.getPaymentMethodCode())
                .orElseThrow(() -> new ResourceNotFoundException("Phương thức thanh toán không hợp lệ: " + request.getPaymentMethodCode()));

        Payment payment = Payment.builder()
                .order(savedOrder)
                .paymentMethod(paymentMethod)
                .amount(savedOrder.getTotalAmount())
                .status("PENDING") 
                .build();
        paymentRepository.save(payment);

        for (OrderItem item : savedOrder.getItems()) {
            ProductVariant variant = item.getProductVariant();
            variant.setStockQuantity(variant.getStockQuantity() - item.getQuantity());
            productVariantRepository.save(variant);
        }

        cartItemRepository.deleteAllByCart_Customer_IdAndProductVariant_IdIn(customer.getId(), requestedVariantIds);

        return OrderResponse.builder()
                .id(savedOrder.getId())
                .code(savedOrder.getCode())
                .totalAmount(savedOrder.getTotalAmount())
                .status(savedOrder.getStatus()) 
                .build();
    }

    @Override
    public OrderDetailResponse getOrderDetailsById(Long orderId, Long userId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn hàng với ID: " + orderId));
        User currentUser = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng với ID: " + userId));
        boolean isOwner = order.getCustomer().getUserProfile().getId().equals(currentUser.getUserProfile().getId());
        boolean isAdmin = currentUser.getRole().getCode().equals("ADMIN");

        if (!isOwner && !isAdmin) {
            throw new AccessDeniedException("Bạn không có quyền xem chi tiết đơn hàng này.");
        }
        List<OrderItemResponse> itemResponses = order.getItems().stream()
                .map(this::convertToOrderItemResponse)
                .collect(Collectors.toList());

        UserProfile profile = order.getCustomer().getUserProfile();
        String customerName = profile != null ? profile.getFullName() : "Khách lẻ";
        String phone = profile != null ? profile.getPhone() : "N/A";
        String address = profile != null ? profile.getAddress() : "N/A";

        String paymentMethodName = paymentRepository.findByOrder_Id(order.getId()).stream()
                .findFirst()
                .map(p -> p.getPaymentMethod().getName())
                .orElse("Chưa xác định");

        return new OrderDetailResponse(
                order.getId(),
                order.getCode(),
                order.getCreatedAt(), 
                order.getStatus(),
                customerName,
                phone,
                address,
                paymentMethodName,
                order.getTotalAmount(),
                new BigDecimal("30000"),
                itemResponses
        );
    }

    private OrderItemResponse convertToOrderItemResponse(OrderItem item) {
        ProductVariant variant = item.getProductVariant();
        String imageUrl = variant.getImages().stream()
                .filter(ProductImage::getIsPrimary)
                .findFirst()
                .or(() -> variant.getImages().stream().findFirst())
                .map(ProductImage::getImageUrl).orElse(null);

        return new OrderItemResponse(variant.getProduct().getId(), variant.getProduct().getName(), variant.getCode(), imageUrl, item.getQuantity(), item.getPriceAtPurchase(), item.getPriceAtPurchase().multiply(BigDecimal.valueOf(item.getQuantity())));
    }
    @Override
    @Transactional(readOnly = true)
    public Page<OrderResponse> getMyOrders(Long userId, Pageable pageable) {
        Customer customer = resolveCustomer(userId);
        return orderRepository.findByCustomer_IdOrderByCreatedAtDesc(customer.getId(), pageable)
                .map(this::mapToOrderResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<OrderResponse> getAllOrders(Pageable pageable) {
        return orderRepository.findAll(pageable)
                .map(this::mapToOrderResponse);
    }

    @Override
    @Transactional
    public OrderResponse updateOrderStatus(Long orderId, String status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        order.setStatus(status);
        Order updatedOrder = orderRepository.save(order);
        return mapToOrderResponse(updatedOrder);
    }

    @Override
    @Transactional
    public void cancelOrder(Long orderId, Long userId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn hàng với ID: " + orderId));

        Customer customer = resolveCustomer(userId);
        if (!order.getCustomer().getId().equals(customer.getId())) {
            throw new AccessDeniedException("Bạn không có quyền hủy đơn hàng này.");
        }

        if (!"PENDING".equals(order.getStatus())) {
            throw new InvalidRequestException("Chỉ có thể hủy đơn hàng ở trạng thái 'Chờ xác nhận'.");
        }

        order.setStatus("CANCELLED");

        // Hoàn trả số lượng sản phẩm vào kho
        for (OrderItem item : order.getItems()) {
            ProductVariant variant = item.getProductVariant();
            variant.setStockQuantity(variant.getStockQuantity() + item.getQuantity());
            productVariantRepository.save(variant);
        }

        orderRepository.save(order);
    }
    private OrderResponse mapToOrderResponse(Order order) {
        List<OrderItemResponse> itemResponses = order.getItems().stream()
                .map(item -> {
                    ProductVariant variant = item.getProductVariant();
                    String imageUrl = variant.getImages().stream()
                            .findFirst()
                            .map(ProductImage::getImageUrl).orElse(null);

                    return new OrderItemResponse(
                            variant.getProduct().getId(), variant.getProduct().getName(),
                            variant.getCode(), imageUrl, item.getQuantity(),
                            item.getPriceAtPurchase(),
                            item.getPriceAtPurchase().multiply(BigDecimal.valueOf(item.getQuantity())));
                })
                .collect(Collectors.toList());

        CustomerResponse customerResponse = null;
        if (order.getCustomer() != null) {
            UserProfile userProfile = order.getCustomer().getUserProfile();
            UserProfileResponse userProfileResponse = null;
            if (userProfile != null) {
                userProfileResponse = new UserProfileResponse(userProfile.getId(), userProfile.getFullName(), userProfile.getPhone(), userProfile.getAddress());
            }
            customerResponse = new CustomerResponse(order.getCustomer().getId(), userProfileResponse);
        }

        return OrderResponse.builder()
                .id(order.getId())
                .code(order.getCode())
                .discountAmount(order.getDiscountAmount())
                .totalAmount(order.getTotalAmount())
                .status(order.getStatus())
                .createdAt(order.getCreatedAt()) 
                .customer(customerResponse) 
                .items(itemResponses)
                .build();
    }

    private Customer resolveCustomer(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new InvalidRequestException("User not found"));

        return customerRepository
                .findByUserProfileId(user.getUserProfile().getId())
                .orElseThrow(() -> new InvalidRequestException("Customer not found"));
    }
}