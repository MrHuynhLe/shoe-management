package com.vn.backend.service.impl;

import com.vn.backend.dto.request.PlaceOrderRequest;
import com.vn.backend.dto.request.ValidateDiscountRequest;
import com.vn.backend.dto.request.OrderItemRequest;
import com.vn.backend.dto.response.*;
import com.vn.backend.dto.ghtk.GhtkFeeRequest;
import com.vn.backend.entity.*;
import com.vn.backend.exception.InvalidRequestException;
import com.vn.backend.exception.ResourceNotFoundException;
import com.vn.backend.repository.*;
import com.vn.backend.security.CustomUserDetails;
import com.vn.backend.service.DiscountService;
import com.vn.backend.service.OrderService;
import com.vn.backend.service.GhtkService;
import com.vn.backend.service.impl.GHTKLogicHandler;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
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
    private final CouponUsageRepository couponUsageRepository;
    private final PromotionRepository promotionRepository;
    private final EmployeeRepository employeeRepository;
    private final GhtkService ghtkService; // Inject GhtkService
    private final GHTKLogicHandler ghtkLogicHandler;
    private final OrderStatusHistoryRepository orderStatusHistoryRepository;

    private static final String ORDER_TYPE_ONLINE = "ONLINE";
    private static final String ORDER_STATUS_PENDING = "PENDING";
    private static final String ORDER_STATUS_CONFIRMED = "CONFIRMED";
    private static final String ORDER_STATUS_SHIPPING = "SHIPPING";
    private static final String ORDER_STATUS_COMPLETED = "COMPLETED";
    private static final String ORDER_STATUS_CANCELLED = "CANCELLED";


    @Override
    @Transactional
    public OrderResponse placeOrder(Long userId, PlaceOrderRequest request) {
        Customer customer = resolveCustomer(userId);

        BigDecimal subTotal = BigDecimal.ZERO;
        List<OrderItem> orderItems = new ArrayList<>();
        List<Long> requestedVariantIds = request.getItems().stream()
                .map(OrderItemRequest::getVariantId)
                .toList();

        Map<Long, ProductVariant> variantsMap = productVariantRepository.findAllById(requestedVariantIds)
                .stream()
                .collect(Collectors.toMap(ProductVariant::getId, variant -> variant));

        for (OrderItemRequest itemRequest : request.getItems()) {
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
        Promotion appliedPromotion = null;
        Coupon appliedCoupon = null;

        if (StringUtils.hasText(request.getVoucherCode())) {
            ValidateDiscountRequest discountRequest = new ValidateDiscountRequest();
            discountRequest.setCode(request.getVoucherCode());
            discountRequest.setSubtotal(subTotal);

            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();

            ValidateDiscountResponse discountResponse = discountService.validateDiscount(discountRequest, userDetails);
            discountAmount = defaultZero(discountResponse.getDiscountAmount());

            Optional<Promotion> promotionOpt = promotionRepository.findByCode(request.getVoucherCode());
            if (promotionOpt.isPresent()) {
                appliedPromotion = promotionOpt.get();
            } else {
                appliedCoupon = discountService.findCouponByCode(request.getVoucherCode());
            }
        }

        List<Integer> itemQuantities = request.getItems().stream()
                .map(OrderItemRequest::getQuantity)
                .toList();

        BigDecimal shippingFee = ghtkLogicHandler.calculateShippingFee(
                request.getShippingInfo().getProvince(),
                request.getShippingInfo().getDistrict(),
                request.getShippingInfo().getAddress(),
                subTotal,
                itemQuantities
        );

        BigDecimal totalAmount = subTotal.add(shippingFee).subtract(discountAmount);

        Employee employee = null;
        if (request.getEmployeeId() != null) {
            employee = employeeRepository.findById(request.getEmployeeId()).orElse(null);
        }

        Order order = Order.builder()
                .code("ORD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .customer(customer)
                .employee(employee)
                .status(ORDER_STATUS_PENDING)
                .orderType(ORDER_TYPE_ONLINE)
                .discountAmount(discountAmount)
                .totalAmount(totalAmount)
                .shippingFee(shippingFee)
                .voucherCode(request.getVoucherCode())
                .build();

        OrderShippingDetails shippingDetails = new OrderShippingDetails();
        shippingDetails.setOrder(order);
        shippingDetails.setShippingName(request.getShippingInfo().getCustomerName());
        shippingDetails.setShippingPhone(request.getShippingInfo().getPhone());
        shippingDetails.setShippingAddress(request.getShippingInfo().getAddress());
        shippingDetails.setShippingNote(request.getShippingInfo().getNote());
        shippingDetails.setProvince(request.getShippingInfo().getProvince());
        shippingDetails.setDistrict(request.getShippingInfo().getDistrict());
        shippingDetails.setWard(request.getShippingInfo().getWard());
        order.setShippingDetails(shippingDetails);

        for (OrderItem item : orderItems) {
            item.setOrder(order);
        }
        order.setItems(orderItems);

        Order savedOrder = orderRepository.save(order);

        saveOrderStatusHistory(savedOrder, null, ORDER_STATUS_PENDING);

        if (appliedPromotion != null || appliedCoupon != null) {
            CouponUsage usage = CouponUsage.builder()
                    .order(savedOrder)
                    .customer(customer)
                    .promotion(appliedPromotion)
                    .coupon(appliedCoupon)
                    .build();
            couponUsageRepository.save(usage);
        }

        PaymentMethod paymentMethod = paymentMethodRepository.findByCode(request.getPaymentMethodCode())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Phương thức thanh toán không hợp lệ: " + request.getPaymentMethodCode()
                ));

        Payment payment = Payment.builder()
                .order(savedOrder)
                .paymentMethod(paymentMethod)
                .amount(savedOrder.getTotalAmount())
                .status("PENDING")
                .build();

        paymentRepository.save(payment);

        cartItemRepository.deleteAllByCart_Customer_IdAndProductVariant_IdIn(customer.getId(), requestedVariantIds);

        return mapToOrderResponse(savedOrder);
    }

    @Override
    @Transactional(readOnly = true)
    public OrderDetailResponse getOrderDetailsById(Long orderId, Long userId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn hàng với ID: " + orderId));

        User currentUser = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng với ID: " + userId));

        boolean isOwner = order.getCustomer() != null
                && order.getCustomer().getUserProfile() != null
                && order.getCustomer().getUserProfile().getId().equals(currentUser.getUserProfile().getId());

        boolean isAdmin = currentUser.getRole() != null
                && "ADMIN".equals(currentUser.getRole().getCode());

        if (!isOwner && !isAdmin) {
            throw new AccessDeniedException("Bạn không có quyền xem chi tiết đơn hàng này.");
        }

        List<OrderItemResponse> itemResponses = order.getItems().stream()
                .map(this::convertToOrderItemResponse)
                .collect(Collectors.toList());

        OrderShippingDetails shippingDetails = order.getShippingDetails();
        String customerName = shippingDetails != null ? shippingDetails.getShippingName() : "N/A";
        String phone = shippingDetails != null ? shippingDetails.getShippingPhone() : "N/A";
        String address = shippingDetails != null ? shippingDetails.getShippingAddress() : "N/A";
        String province = shippingDetails != null ? shippingDetails.getProvince() : null;
        String district = shippingDetails != null ? shippingDetails.getDistrict() : null;
        String ward = shippingDetails != null ? shippingDetails.getWard() : null;
        String fullAddress = buildFullAddress(address, ward, district, province);

        Long employeeId = order.getEmployee() != null ? order.getEmployee().getId() : null;
        String employeeName = order.getEmployee() != null && order.getEmployee().getUserProfile() != null
                ? order.getEmployee().getUserProfile().getFullName()
                : null;

        String paymentMethodName = paymentRepository.findByOrder_Id(order.getId()).stream()
                .findFirst()
                .map(payment -> payment.getPaymentMethod().getName())
                .orElse("Chưa xác định");

        BigDecimal subtotalAmount = calculateSubtotal(order.getItems());
        BigDecimal discountAmount = defaultZero(order.getDiscountAmount());
        BigDecimal discountPercent = calculateDiscountPercent(subtotalAmount, discountAmount);

        List<OrderStatusHistoryResponse> statusHistory = orderStatusHistoryRepository
                .findByOrder_IdOrderByChangedAtAsc(order.getId())
                .stream()
                .map(this::mapToStatusHistoryResponse)
                .collect(Collectors.toList());

        return new OrderDetailResponse(
                order.getId(),
                order.getCode(),
                order.getCreatedAt(),
                order.getStatus(),
                customerName,
                phone,
                address,
                province,
                district,
                ward,
                paymentMethodName,
                subtotalAmount,
                order.getTotalAmount(),
                order.getVoucherCode(),
                discountAmount,
                discountPercent,
                order.getShippingFee(),
                fullAddress,
                order.getOrderType(),
                employeeId,
                employeeName,
                itemResponses,
                statusHistory
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
        Pageable sortedPageable = PageRequest.of(
                pageable.getPageNumber(),
                pageable.getPageSize(),
                Sort.by(Sort.Direction.DESC, "createdAt")
        );

        return orderRepository.findAll(sortedPageable)
                .map(this::mapToOrderResponse);
    }

    @Override
    @Transactional
    public OrderResponse updateOrderStatus(Long orderId, String status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        String normalizedStatus = status == null ? null : status.trim().toUpperCase();
        validateOrderStatus(normalizedStatus);

        String previousStatus = order.getStatus();
        if (normalizedStatus.equals(previousStatus)) {
            return mapToOrderResponse(order);
        }

        if (ORDER_STATUS_CANCELLED.equals(previousStatus) || ORDER_STATUS_COMPLETED.equals(previousStatus)) {
            throw new InvalidRequestException("Không thể cập nhật trạng thái từ đơn hàng đã kết thúc.");
        }

        if (ORDER_STATUS_SHIPPING.equals(normalizedStatus)) {
            for (OrderItem item : order.getItems()) {
                ProductVariant variant = item.getProductVariant();
                if (variant.getStockQuantity() < item.getQuantity()) {
                    throw new InvalidRequestException(
                            "Không đủ số lượng tồn kho cho sản phẩm: "
                                    + variant.getProduct().getName()
                                    + " - "
                                    + variant.getCode()
                    );
                }

                variant.setStockQuantity(variant.getStockQuantity() - item.getQuantity());
                productVariantRepository.save(variant);
            }
        }

        order.setStatus(normalizedStatus);
        Order updatedOrder = orderRepository.save(order);

        saveOrderStatusHistory(updatedOrder, previousStatus, normalizedStatus);

        return mapToOrderResponse(updatedOrder);
    }

    @Override
    @Transactional
    public void cancelOrder(Long orderId, Long userId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn hàng với ID: " + orderId));

        Customer customer = resolveCustomer(userId);
        if (order.getCustomer() == null || !order.getCustomer().getId().equals(customer.getId())) {
            throw new AccessDeniedException("Bạn không có quyền hủy đơn hàng này.");
        }

        if (!ORDER_STATUS_PENDING.equals(order.getStatus())) {
            throw new InvalidRequestException("Chỉ có thể hủy đơn hàng ở trạng thái 'Chờ xác nhận'.");
        }

        String previousStatus = order.getStatus();
        order.setStatus(ORDER_STATUS_CANCELLED);

        couponUsageRepository.deleteByOrder_Id(order.getId());
        orderRepository.save(order);

        saveOrderStatusHistory(order, previousStatus, ORDER_STATUS_CANCELLED);
    }

    @Override
    public List<OrderShippingAddressResponse> getUserShippingAddresses(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Customer customer = customerRepository
                .findByUserProfileId(user.getUserProfile().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

        return orderRepository.findAll()
                .stream()
                .filter(order -> order.getCustomer() != null && order.getCustomer().getId().equals(customer.getId()))
                .sorted((o1, o2) -> o2.getCreatedAt().compareTo(o1.getCreatedAt()))
                .filter(order -> order.getShippingDetails() != null)
                .map(order -> {
                    OrderShippingDetails details = order.getShippingDetails();
                    OrderShippingAddressResponse response = new OrderShippingAddressResponse();
                    response.setFullName(details.getShippingName());
                    response.setPhone(details.getShippingPhone());
                    response.setAddress(details.getShippingAddress());
                    response.setProvince(details.getProvince());
                    response.setDistrict(details.getDistrict());
                    response.setWard(details.getWard());
                    response.setNote(details.getShippingNote());
                    return response;
                })
                .distinct()
                .collect(Collectors.toList());
    }
    private OrderResponse mapToOrderResponse(Order order) {
        String customerName = null;
        String phone = null;
        String address = null;
        String province = null;
        String district = null;
        String ward = null;
        String fullAddress = null;

        if (order.getShippingDetails() != null) {
            OrderShippingDetails details = order.getShippingDetails();
            customerName = details.getShippingName();
            phone = details.getShippingPhone();
            address = details.getShippingAddress();
            province = details.getProvince();
            district = details.getDistrict();
            ward = details.getWard();
            fullAddress = buildFullAddress(address, ward, district, province);
        } else if (order.getCustomer() != null && order.getCustomer().getUserProfile() != null) {
            customerName = order.getCustomer().getUserProfile().getFullName();
            phone = order.getCustomer().getUserProfile().getPhone();
            address = order.getCustomer().getUserProfile().getAddress();
            fullAddress = address;
        }

        Long employeeId = order.getEmployee() != null ? order.getEmployee().getId() : null;
        String employeeName = order.getEmployee() != null && order.getEmployee().getUserProfile() != null
                ? order.getEmployee().getUserProfile().getFullName()
                : null;

        List<OrderItemResponse> itemResponses = order.getItems().stream()
                .map(this::convertToOrderItemResponse)
                .collect(Collectors.toList());

        CustomerResponse customerResponse = null;
        if (order.getCustomer() != null) {
            UserProfile userProfile = order.getCustomer().getUserProfile();
            UserProfileResponse userProfileResponse = null;
            if (userProfile != null) {
                userProfileResponse = new UserProfileResponse(
                        userProfile.getId(),
                        userProfile.getFullName(),
                        userProfile.getPhone(),
                        userProfile.getAddress()
                );
            }
            customerResponse = new CustomerResponse(order.getCustomer().getId(), userProfileResponse);
        }

        BigDecimal subtotalAmount = calculateSubtotal(order.getItems());
        BigDecimal discountAmount = defaultZero(order.getDiscountAmount());
        BigDecimal discountPercent = calculateDiscountPercent(subtotalAmount, discountAmount);

        return OrderResponse.builder()
                .id(order.getId())
                .code(order.getCode())
                .discountAmount(discountAmount)
                .discountPercent(discountPercent)
                .totalAmount(order.getTotalAmount())
                .subtotalAmount(subtotalAmount)
                .voucherCode(order.getVoucherCode())
                .status(order.getStatus())
                .createdAt(order.getCreatedAt())
                .customer(customerResponse)
                .items(itemResponses)
                .customerName(customerName)
                .phone(phone)
                .address(address)
                .province(province)
                .district(district)
                .ward(ward)
                .fullAddress(fullAddress)
                .orderType(order.getOrderType())
                .employeeId(employeeId)
                .employeeName(employeeName)
                .build();
    }

    private OrderStatusHistoryResponse mapToStatusHistoryResponse(OrderStatusHistory history) {
        return OrderStatusHistoryResponse.builder()
                .id(history.getId())
                .orderId(history.getOrder() != null ? history.getOrder().getId() : null)
                .fromStatus(history.getFromStatus())
                .toStatus(history.getToStatus())
                .changedAt(history.getChangedAt())
                .build();
    }

    private BigDecimal calculateSubtotal(List<OrderItem> items) {
        return items.stream()
                .map(item -> defaultZero(item.getPriceAtPurchase())
                        .multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private BigDecimal calculateDiscountPercent(BigDecimal subtotalAmount, BigDecimal discountAmount) {
        if (subtotalAmount == null || discountAmount == null || subtotalAmount.compareTo(BigDecimal.ZERO) <= 0) {
            return BigDecimal.ZERO;
        }

        return discountAmount
                .multiply(BigDecimal.valueOf(100))
                .divide(subtotalAmount, 2, RoundingMode.HALF_UP);
    }

    private String buildFullAddress(String address, String ward, String district, String province) {
        return java.util.stream.Stream.of(address, ward, district, province)
                .filter(StringUtils::hasText)
                .collect(Collectors.joining(", "));
    }

    private void validateOrderStatus(String status) {
        List<String> validStatuses = List.of(
                ORDER_STATUS_PENDING,
                ORDER_STATUS_CONFIRMED,
                ORDER_STATUS_SHIPPING,
                ORDER_STATUS_COMPLETED,
                ORDER_STATUS_CANCELLED
        );

        if (!StringUtils.hasText(status) || !validStatuses.contains(status)) {
            throw new InvalidRequestException("Trạng thái đơn hàng không hợp lệ: " + status);
        }
    }

    private void saveOrderStatusHistory(Order order, String fromStatus, String toStatus) {
        OrderStatusHistory history = OrderStatusHistory.builder()
                .order(order)
                .fromStatus(fromStatus)
                .toStatus(toStatus)
                .changedAt(OffsetDateTime.now())
                .build();

        orderStatusHistoryRepository.save(history);
    }

    private BigDecimal defaultZero(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }

    private Customer resolveCustomer(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new InvalidRequestException("User not found"));

        return customerRepository
                .findByUserProfileId(user.getUserProfile().getId())
                .orElseThrow(() -> new InvalidRequestException("Customer not found"));
    }
}