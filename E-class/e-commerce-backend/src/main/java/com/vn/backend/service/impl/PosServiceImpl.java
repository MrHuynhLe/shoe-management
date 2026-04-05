package com.vn.backend.service.impl;

import com.vn.backend.dto.request.pos.PosAddItemRequest;
import com.vn.backend.dto.request.pos.PosAssignCustomerRequest;
import com.vn.backend.dto.request.pos.PosCheckoutRequest;
import com.vn.backend.dto.request.pos.PosCreateOrderRequest;
import com.vn.backend.dto.request.pos.PosUpdateItemRequest;
import com.vn.backend.dto.response.pos.PosAvailableDiscountResponse;
import com.vn.backend.dto.response.pos.PosOrderItemResponse;
import com.vn.backend.dto.response.pos.PosOrderResponse;
import com.vn.backend.dto.response.pos.PosProductSearchResponse;
import com.vn.backend.entity.AttributeValue;
import com.vn.backend.entity.Customer;
import com.vn.backend.entity.Employee;
import com.vn.backend.entity.InventoryTransaction;
import com.vn.backend.entity.Order;
import com.vn.backend.entity.OrderItem;
import com.vn.backend.entity.OrderStatusHistory;
import com.vn.backend.entity.Payment;
import com.vn.backend.entity.PaymentMethod;
import com.vn.backend.entity.Product;
import com.vn.backend.entity.ProductImage;
import com.vn.backend.entity.ProductVariant;
import com.vn.backend.entity.Store;
import com.vn.backend.entity.VariantAttributeValue;
import com.vn.backend.repository.CustomerRepository;
import com.vn.backend.repository.EmployeeRepository;
import com.vn.backend.repository.InventoryTransactionRepository;
import com.vn.backend.repository.OrderItemRepository;
import com.vn.backend.repository.OrderRepository;
import com.vn.backend.repository.OrderStatusHistoryRepository;
import com.vn.backend.repository.PaymentMethodRepository;
import com.vn.backend.repository.PaymentRepository;
import com.vn.backend.repository.ProductImageRepository;
import com.vn.backend.repository.ProductVariantRepository;
import com.vn.backend.repository.StoreRepository;
import com.vn.backend.service.PosService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.vn.backend.entity.Coupon;
import com.vn.backend.entity.CouponUsage;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

import com.vn.backend.entity.Promotion;
import com.vn.backend.repository.CouponRepository;
import com.vn.backend.repository.CouponUsageRepository;
import com.vn.backend.repository.PromotionRepository;

import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.Comparator;




@Service
@RequiredArgsConstructor
@Transactional
public class PosServiceImpl implements PosService {

    private static final String ORDER_STATUS_DRAFT = "DRAFT";
    private static final String ORDER_STATUS_COMPLETED = "COMPLETED";
    private static final String ORDER_STATUS_CANCELLED = "CANCELLED";
    private static final String ORDER_TYPE_POS = "POS";
    private static final String PAYMENT_STATUS_PAID = "PAID";
    private static final String INVENTORY_OUT = "OUT";

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final ProductVariantRepository productVariantRepository;
    private final ProductImageRepository productImageRepository;
    private final CustomerRepository customerRepository;
    private final EmployeeRepository employeeRepository;
    private final StoreRepository storeRepository;
    private final PaymentMethodRepository paymentMethodRepository;
    private final PaymentRepository paymentRepository;
    private final InventoryTransactionRepository inventoryTransactionRepository;
    private final OrderStatusHistoryRepository orderStatusHistoryRepository;

    private final PromotionRepository promotionRepository;
    private final CouponRepository couponRepository;
    private final CouponUsageRepository couponUsageRepository;

    @Override
    public PosOrderResponse createOrder(PosCreateOrderRequest request) {
        Employee employee = employeeRepository.findById(request.getEmployeeId().longValue())
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy nhân viên"));

        Store store = storeRepository.findById(request.getStoreId().longValue())
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy cửa hàng"));

        Customer customer = null;
        if (request.getCustomerId() != null) {
            customer = customerRepository.findById(request.getCustomerId().longValue())
                    .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy khách hàng"));
        }

        Order order = Order.builder()
                .code(generateOrderCode())
                .customer(customer)
                .employee(employee)
                .store(store)
                .totalAmount(BigDecimal.ZERO)
                .discountAmount(BigDecimal.ZERO)
                .shippingFee(BigDecimal.ZERO)
                .status(ORDER_STATUS_DRAFT)
                .orderType(ORDER_TYPE_POS)
                .note(request.getNote())
                .customerPaid(BigDecimal.ZERO)
                .createdAt(OffsetDateTime.now())
                .build();

        orderRepository.save(order);
        saveOrderStatusHistory(order, null, ORDER_STATUS_DRAFT);

        return mapToOrderResponse(order);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PosOrderResponse> getDraftOrders() {
        return orderRepository.findByStatusAndOrderTypeOrderByCreatedAtDesc(ORDER_STATUS_DRAFT, ORDER_TYPE_POS)
                .stream()
                .map(this::mapToOrderResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public PosOrderResponse getOrderDetail(Long orderId) {
        return mapToOrderResponse(getOrderOrThrow(orderId));
    }

    @Override
    @Transactional(readOnly = true)
    public List<PosProductSearchResponse> searchProducts(String keyword) {
        String safeKeyword = keyword == null ? "" : keyword.trim();

        List<ProductVariant> variants = safeKeyword.isBlank()
                ? productVariantRepository.findAll()
                : productVariantRepository.searchForPos(safeKeyword);

        return variants.stream()
                .filter(this::isSellableVariant)
                .map(this::mapToProductSearchResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public PosProductSearchResponse getProductByBarcode(String barcode) {
        ProductVariant variant = productVariantRepository.findByBarcode(barcode)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy sản phẩm"));

        if (!isSellableVariant(variant)) {
            throw new IllegalArgumentException("Sản phẩm không khả dụng để bán");
        }

        return mapToProductSearchResponse(variant);
    }

    @Override
    public PosOrderResponse addItem(Long orderId, PosAddItemRequest request) {
        Order order = getDraftOrderOrThrow(orderId);

        ProductVariant variant = productVariantRepository.findById(request.getProductVariantId())
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy biến thể sản phẩm"));

        if (!isSellableVariant(variant)) {
            throw new IllegalArgumentException("Sản phẩm không khả dụng để bán");
        }

        if (variant.getStockQuantity() == null || variant.getStockQuantity() < request.getQuantity()) {
            throw new IllegalArgumentException("Số lượng tồn kho không đủ");
        }

        Optional<OrderItem> existingItemOpt =
                orderItemRepository.findByOrder_IdAndProductVariant_Id(orderId, request.getProductVariantId());

        if (existingItemOpt.isPresent()) {
            OrderItem existingItem = existingItemOpt.get();
            int newQuantity = existingItem.getQuantity() + request.getQuantity();

            if (variant.getStockQuantity() < newQuantity) {
                throw new IllegalArgumentException("Số lượng tồn kho không đủ");
            }

            existingItem.setQuantity(newQuantity);
            orderItemRepository.save(existingItem);
        } else {
            OrderItem newItem = OrderItem.builder()
                    .order(order)
                    .productVariant(variant)
                    .quantity(request.getQuantity())
                    .priceAtPurchase(variant.getSellingPrice())
                    .costPriceAtPurchase(variant.getCostPrice())
                    .build();

            orderItemRepository.save(newItem);
        }

        recalculateOrderAmounts(order);
        orderRepository.save(order);

        return mapToOrderResponse(order);
    }

    @Override
    public PosOrderResponse updateItem(Long orderId, Long itemId, PosUpdateItemRequest request) {
        Order order = getDraftOrderOrThrow(orderId);

        OrderItem item = orderItemRepository.findById(itemId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy sản phẩm trong hóa đơn"));

        validateItemBelongsToOrder(item, orderId);

        ProductVariant variant = productVariantRepository.findById(item.getProductVariant().getId().longValue())
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy biến thể sản phẩm"));

        if (variant.getStockQuantity() == null || variant.getStockQuantity() < request.getQuantity()) {
            throw new IllegalArgumentException("Số lượng tồn kho không đủ");
        }

        item.setQuantity(request.getQuantity());
        orderItemRepository.save(item);

        recalculateOrderAmounts(order);
        orderRepository.save(order);

        return mapToOrderResponse(order);
    }

    @Override
    public PosOrderResponse removeItem(Long orderId, Long itemId) {
        Order order = getDraftOrderOrThrow(orderId);

        OrderItem item = orderItemRepository.findById(itemId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy sản phẩm trong hóa đơn"));

        validateItemBelongsToOrder(item, orderId);

        orderItemRepository.delete(item);

        recalculateOrderAmounts(order);
        orderRepository.save(order);

        return mapToOrderResponse(order);
    }

    @Override
    public PosOrderResponse assignCustomer(Long orderId, PosAssignCustomerRequest request) {
        Order order = getDraftOrderOrThrow(orderId);

        if (request.getCustomerId() == null) {
            order.setCustomer(null);
        } else {
            Customer customer = customerRepository.findById(request.getCustomerId().longValue())
                    .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy khách hàng"));
            order.setCustomer(customer);
        }

        orderRepository.save(order);
        return mapToOrderResponse(order);
    }

    @Override
    public PosOrderResponse checkout(Long orderId, PosCheckoutRequest request) {
        Order order = getDraftOrderOrThrow(orderId);

        List<OrderItem> items = orderItemRepository.findByOrder_Id(orderId);
        if (items.isEmpty()) {
            throw new IllegalArgumentException("Hóa đơn chưa có sản phẩm");
        }

        PaymentMethod paymentMethod = paymentMethodRepository.findById(request.getPaymentMethodId())
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy phương thức thanh toán"));

        recalculateOrderAmounts(order);
        BigDecimal totalAmount = defaultZero(order.getTotalAmount());

        BigDecimal discountAmount = BigDecimal.ZERO;
        String appliedVoucherCode = null;

        boolean hasCoupon = request.getCouponId() != null;
        boolean hasPromotion = request.getPromotionId() != null;

        if (hasCoupon && hasPromotion) {
            throw new IllegalArgumentException("Chỉ được áp dụng một voucher cho mỗi hóa đơn");
        }

        if (hasCoupon) {
            if (order.getCustomer() == null) {
                throw new IllegalArgumentException("Hóa đơn phải có khách hàng để dùng coupon");
            }

            Coupon coupon = couponRepository.findById(request.getCouponId())
                    .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy coupon"));

            if (!isCouponApplicable(coupon, order, totalAmount)) {
                throw new IllegalArgumentException("Coupon không còn hợp lệ hoặc không đủ điều kiện áp dụng");
            }

            discountAmount = calculateDiscountAmount(
                    totalAmount,
                    coupon.getDiscountType(),
                    coupon.getDiscountValue(),
                    null
            );

            appliedVoucherCode = coupon.getCode();
        }

        if (hasPromotion) {
            Promotion promotion = promotionRepository.findById(request.getPromotionId())
                    .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy chương trình khuyến mãi"));

            if (!isPromotionApplicable(promotion, order, totalAmount)) {
                throw new IllegalArgumentException("Khuyến mãi không còn hợp lệ hoặc không đủ điều kiện áp dụng");
            }

            discountAmount = calculateDiscountAmount(
                    totalAmount,
                    promotion.getDiscountType(),
                    promotion.getDiscountValue(),
                    promotion.getMaxDiscountAmount()
            );

            appliedVoucherCode = promotion.getCode();
        }

        if (discountAmount.compareTo(totalAmount) > 0) {
            throw new IllegalArgumentException("Giảm giá không được lớn hơn tổng tiền hàng");
        }

        BigDecimal finalAmount = totalAmount.subtract(discountAmount);
        BigDecimal customerPaid = defaultZero(request.getCustomerPaid());

        if (customerPaid.compareTo(finalAmount) < 0) {
            throw new IllegalArgumentException("Tiền khách trả không đủ");
        }

        for (OrderItem item : items) {
            ProductVariant lockedVariant = productVariantRepository.findByIdForUpdate(item.getProductVariant().getId().longValue())
                    .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy biến thể sản phẩm"));

            if (lockedVariant.getStockQuantity() == null || lockedVariant.getStockQuantity() < item.getQuantity()) {
                throw new IllegalArgumentException("Sản phẩm " + lockedVariant.getCode() + " không đủ tồn kho");
            }
        }

        order.setDiscountAmount(discountAmount);
        order.setVoucherCode(appliedVoucherCode);
        order.setCustomerPaid(customerPaid);
        order.setNote(request.getNote() != null ? request.getNote() : order.getNote());
        order.setStatus(ORDER_STATUS_COMPLETED);
        orderRepository.save(order);

        Payment payment = Payment.builder()
                .order(order)
                .paymentMethod(paymentMethod)
                .amount(finalAmount)
                .status(PAYMENT_STATUS_PAID)
                .build();
        paymentRepository.save(payment);

        saveVoucherUsage(order, request);

        for (OrderItem item : items) {
            InventoryTransaction transaction = new InventoryTransaction();
            transaction.setReferenceCode(
                    generateInventoryTransactionCode(
                            order.getId().longValue(),
                            item.getProductVariant().getId().longValue()
                    )
            );
            transaction.setProductVariant(item.getProductVariant());
            transaction.setStore(order.getStore());
            transaction.setQuantity(item.getQuantity());
            transaction.setTransactionType(INVENTORY_OUT);
            transaction.setCreatedAt(LocalDateTime.now());

            inventoryTransactionRepository.save(transaction);
        }

        saveOrderStatusHistory(order, ORDER_STATUS_DRAFT, ORDER_STATUS_COMPLETED);

        return mapToOrderResponse(order);
    }

    @Override
    public void cancelOrder(Long orderId) {
        Order order = getDraftOrderOrThrow(orderId);
        order.setStatus(ORDER_STATUS_CANCELLED);
        orderRepository.save(order);

        saveOrderStatusHistory(order, ORDER_STATUS_DRAFT, ORDER_STATUS_CANCELLED);
    }

    private Order getOrderOrThrow(Long orderId) {
        return orderRepository.findById(orderId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy hóa đơn"));
    }

    private Order getDraftOrderOrThrow(Long orderId) {
        Order order = getOrderOrThrow(orderId);

        if (!ORDER_STATUS_DRAFT.equals(order.getStatus())) {
            throw new IllegalArgumentException("Chỉ thao tác được với hóa đơn nháp");
        }

        if (!ORDER_TYPE_POS.equals(order.getOrderType())) {
            throw new IllegalArgumentException("Đây không phải hóa đơn POS");
        }

        return order;
    }

    private void validateItemBelongsToOrder(OrderItem item, Long orderId) {
        if (item.getOrder() == null || item.getOrder().getId() == null
                || item.getOrder().getId().longValue() != orderId.longValue()) {
            throw new IllegalArgumentException("Sản phẩm không thuộc hóa đơn này");
        }
    }

    private void recalculateOrderAmounts(Order order) {
        List<OrderItem> items = orderItemRepository.findByOrder_Id(order.getId().longValue());

        BigDecimal total = items.stream()
                .map(i -> defaultZero(i.getPriceAtPurchase())
                        .multiply(BigDecimal.valueOf(i.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        order.setTotalAmount(total);

        if (order.getDiscountAmount() == null) {
            order.setDiscountAmount(BigDecimal.ZERO);
        }
        if (order.getShippingFee() == null) {
            order.setShippingFee(BigDecimal.ZERO);
        }
        if (order.getCustomerPaid() == null) {
            order.setCustomerPaid(BigDecimal.ZERO);
        }
    }

    private PosOrderResponse mapToOrderResponse(Order order) {
        List<OrderItem> items = orderItemRepository.findByOrder_Id(order.getId().longValue());

        BigDecimal totalAmount = defaultZero(order.getTotalAmount());
        BigDecimal discountAmount = defaultZero(order.getDiscountAmount());
        BigDecimal shippingFee = defaultZero(order.getShippingFee());
        BigDecimal finalAmount = totalAmount.subtract(discountAmount).add(shippingFee);
        BigDecimal customerPaid = defaultZero(order.getCustomerPaid());
        BigDecimal changeAmount = customerPaid.subtract(finalAmount);

        if (changeAmount.compareTo(BigDecimal.ZERO) < 0) {
            changeAmount = BigDecimal.ZERO;
        }

        String customerName = null;
        if (order.getCustomer() != null && order.getCustomer().getUserProfile() != null) {
            customerName = order.getCustomer().getUserProfile().getFullName();
        }

        return PosOrderResponse.builder()
                .orderId(order.getId())
                .orderCode(order.getCode())
                .status(order.getStatus())
                .customerId(order.getCustomer() != null ? order.getCustomer().getId() : null)
                .customerName(customerName)
                .employeeId(order.getEmployee() != null ? order.getEmployee().getId() : null)
                .storeId(order.getStore() != null ? order.getStore().getId() : null)
                .totalAmount(totalAmount)
                .discountAmount(discountAmount)
                .finalAmount(finalAmount)
                .customerPaid(customerPaid)
                .changeAmount(changeAmount)
                .voucherCode(order.getVoucherCode())
                .orderType(order.getOrderType())
                .note(order.getNote())
                .items(items.stream().map(this::mapToOrderItemResponse).toList())
                .build();
    }

    private PosOrderItemResponse mapToOrderItemResponse(OrderItem item) {
        ProductVariant variant = item.getProductVariant();
        Product product = variant.getProduct();

        BigDecimal price = defaultZero(item.getPriceAtPurchase());
        BigDecimal lineTotal = price.multiply(BigDecimal.valueOf(item.getQuantity()));

        return PosOrderItemResponse.builder()
                .itemId(item.getId())
                .productVariantId(variant.getId())
                .variantCode(variant.getCode())
                .barcode(variant.getBarcode())
                .productName(product != null ? product.getName() : null)
                .price(price)
                .quantity(item.getQuantity())
                .lineTotal(lineTotal)
                .stockQuantity(variant.getStockQuantity())
                .imageUrl(getImageUrl(variant))
                .build();
    }

    private PosProductSearchResponse mapToProductSearchResponse(ProductVariant variant) {
        Product product = variant.getProduct();

        return PosProductSearchResponse.builder()
                .productVariantId(variant.getId())
                .variantCode(variant.getCode())
                .barcode(variant.getBarcode())
                .productCode(product != null ? product.getCode() : null)
                .productName(product != null ? product.getName() : null)
                .sellingPrice(defaultZero(variant.getSellingPrice()))
                .stockQuantity(variant.getStockQuantity())
                .imageUrl(getImageUrl(variant))
                .build();
    }

    private String getImageUrl(ProductVariant variant) {
        Optional<ProductImage> variantImage =
                productImageRepository.findFirstByProductVariant_IdOrderByIsPrimaryDescDisplayOrderAsc(variant.getId().longValue());

        if (variantImage.isPresent()) {
            return variantImage.get().getImageUrl();
        }

        if (variant.getProduct() != null) {
            return productImageRepository
                    .findFirstByProduct_IdOrderByIsPrimaryDescDisplayOrderAsc(variant.getProduct().getId().longValue())
                    .map(ProductImage::getImageUrl)
                    .orElse(null);
        }

        return null;
    }

    private String extractAttributeValue(ProductVariant variant, String attributeCode) {
        if (variant.getVariantAttributeValues() == null) {
            return null;
        }

        return variant.getVariantAttributeValues().stream()
                .map(VariantAttributeValue::getAttributeValue)
                .filter(av -> av != null && av.getAttribute() != null)
                .filter(av -> attributeCode.equalsIgnoreCase(av.getAttribute().getCode()))
                .map(AttributeValue::getValue)
                .findFirst()
                .orElse(null);
    }

    private boolean isSellableVariant(ProductVariant variant) {
        return variant != null
                && variant.getDeletedAt() == null
                && Boolean.TRUE.equals(variant.getIsActive())
                && variant.getProduct() != null
                && variant.getProduct().getDeletedAt() == null
                && Boolean.TRUE.equals(variant.getProduct().getIsActive());
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

    private String generateOrderCode() {
        return "POS-" + System.currentTimeMillis();
    }

    private String generateInventoryTransactionCode(Long orderId, Long variantId) {
        return "PX-POS-" + orderId + "-" + variantId + "-" + System.currentTimeMillis();
    }
    private boolean isPromotionApplicable(Promotion promotion, Order order, BigDecimal subtotal) {
        if (promotion == null || Boolean.FALSE.equals(promotion.getIsActive())) {
            return false;
        }

        if (promotion.getMinOrderValue() != null
                && subtotal.compareTo(promotion.getMinOrderValue()) < 0) {
            return false;
        }

        if (promotion.getUsageLimit() != null && promotion.getUsageLimit() > 0) {
            long usedCount = couponUsageRepository.countByPromotion_Id(promotion.getId());
            if (usedCount >= promotion.getUsageLimit()) {
                return false;
            }
        }

        if (promotion.getUsageLimitPerCustomer() != null
                && promotion.getUsageLimitPerCustomer() > 0
                && order.getCustomer() != null) {
            long customerUsedCount = couponUsageRepository
                    .countByPromotion_IdAndCustomer_Id(promotion.getId(), order.getCustomer().getId());

            if (customerUsedCount >= promotion.getUsageLimitPerCustomer()) {
                return false;
            }
        }

        return true;
    }

    @Override
    @Transactional(readOnly = true)
    public List<PosAvailableDiscountResponse> getAvailableDiscounts(Long orderId) {
        Order order = getDraftOrderOrThrow(orderId);

        List<OrderItem> items = orderItemRepository.findByOrder_Id(orderId);
        BigDecimal subtotal = items.stream()
                .map(item -> defaultZero(item.getPriceAtPurchase())
                        .multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        if (subtotal.compareTo(BigDecimal.ZERO) <= 0) {
            return List.of();
        }

        OffsetDateTime now = OffsetDateTime.now();
        List<PosAvailableDiscountResponse> results = new ArrayList<>();

        List<Promotion> promotions = promotionRepository.findAllAvailableForPos(now);
        for (Promotion promotion : promotions) {
            if (!isPromotionApplicable(promotion, order, subtotal)) {
                continue;
            }
            results.add(mapPromotionToPosDiscountResponse(promotion, order, subtotal));
        }

        if (order.getCustomer() != null) {
            Long customerId = order.getCustomer().getId();

            List<Coupon> coupons = couponRepository.findAvailableCouponsForCustomer(customerId);
            for (Coupon coupon : coupons) {
                if (!isCouponApplicable(coupon, order, subtotal)) {
                    continue;
                }
                results.add(mapCouponToPosDiscountResponse(coupon, order, subtotal));
            }
        }

        results.sort(
                Comparator.comparing(
                                PosAvailableDiscountResponse::getEstimatedDiscountAmount,
                                Comparator.nullsLast(BigDecimal::compareTo)
                        ).reversed()
                        .thenComparing(
                                PosAvailableDiscountResponse::getEndDate,
                                Comparator.nullsLast(OffsetDateTime::compareTo)
                        )
        );

        for (int i = 0; i < results.size(); i++) {
            results.get(i).setBestVoucher(i == 0);
        }

        return results;
    }


    private boolean isCouponApplicable(Coupon coupon, Order order, BigDecimal subtotal) {
        if (coupon == null || order.getCustomer() == null) {
            return false;
        }

        if (Boolean.FALSE.equals(coupon.getIsActive())) {
            return false;
        }

        long usedCountByCustomer = couponUsageRepository
                .countByCoupon_IdAndCustomer_Id(coupon.getId(), order.getCustomer().getId());

        return coupon.getUsageLimit() == null || usedCountByCustomer < coupon.getUsageLimit();
    }

    private PosAvailableDiscountResponse mapCouponToPosDiscountResponse(
            Coupon coupon,
            Order order,
            BigDecimal subtotal
    ) {
        long usedCountByCustomer = couponUsageRepository
                .countByCoupon_IdAndCustomer_Id(coupon.getId(), order.getCustomer().getId());

        int issuedQuantity = coupon.getUsageLimit() != null ? coupon.getUsageLimit() : 0;
        int remainingCount = coupon.getUsageLimit() != null
                ? Math.max(coupon.getUsageLimit() - (int) usedCountByCustomer, 0)
                : 0;

        double usedPercent = 0.0;
        double remainingPercent = 0.0;

        if (issuedQuantity > 0) {
            usedPercent = BigDecimal.valueOf(usedCountByCustomer)
                    .multiply(BigDecimal.valueOf(100))
                    .divide(BigDecimal.valueOf(issuedQuantity), 2, RoundingMode.HALF_UP)
                    .doubleValue();

            remainingPercent = BigDecimal.valueOf(remainingCount)
                    .multiply(BigDecimal.valueOf(100))
                    .divide(BigDecimal.valueOf(issuedQuantity), 2, RoundingMode.HALF_UP)
                    .doubleValue();
        }

        return PosAvailableDiscountResponse.builder()
                .voucherType("COUPON")
                .id(coupon.getId())
                .code(coupon.getCode())
                .name(coupon.getCode())
                .discountType(coupon.getDiscountType())
                .discountValue(coupon.getDiscountValue())
                .minOrderValue(BigDecimal.ZERO)
                .maxDiscountAmount(null)
                .issuedQuantity(issuedQuantity)
                .usedCount(usedCountByCustomer)
                .remainingCount(remainingCount)
                .usedPercent(usedPercent)
                .remainingPercent(remainingPercent)
                .startDate(null)
                .endDate(null)
                .isActive(coupon.getIsActive())
                .estimatedDiscountAmount(calculateDiscountAmount(
                        subtotal,
                        coupon.getDiscountType(),
                        coupon.getDiscountValue(),
                        null
                ))
                .bestVoucher(false)
                .build();
    }

    private BigDecimal calculateDiscountAmount(
            BigDecimal subtotal,
            String discountType,
            BigDecimal discountValue,
            BigDecimal maxDiscountAmount
    ) {
        if (subtotal == null || discountType == null || discountValue == null) {
            return BigDecimal.ZERO;
        }

        String normalizedDiscountType = discountType.trim().toUpperCase();

        BigDecimal discountAmount = BigDecimal.ZERO;

        if ("PERCENTAGE".equals(normalizedDiscountType)) {
            discountAmount = subtotal.multiply(discountValue)
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);

            if (maxDiscountAmount != null && discountAmount.compareTo(maxDiscountAmount) > 0) {
                discountAmount = maxDiscountAmount;
            }
        } else if ("FIXED_AMOUNT".equals(normalizedDiscountType)) {
            discountAmount = discountValue;
        }

        if (discountAmount.compareTo(subtotal) > 0) {
            return subtotal;
        }

        return discountAmount;
    }

    private PosAvailableDiscountResponse mapPromotionToPosDiscountResponse(
            Promotion promotion,
            Order order,
            BigDecimal subtotal
    ) {
        long usedCount = couponUsageRepository.countByPromotion_Id(promotion.getId());

        int issuedQuantity = promotion.getUsageLimit() != null ? promotion.getUsageLimit() : 0;
        int remainingCount = promotion.getUsageLimit() != null
                ? Math.max(promotion.getUsageLimit() - (int) usedCount, 0)
                : 0;

        double usedPercent = 0.0;
        double remainingPercent = 0.0;

        if (issuedQuantity > 0) {
            usedPercent = BigDecimal.valueOf(usedCount)
                    .multiply(BigDecimal.valueOf(100))
                    .divide(BigDecimal.valueOf(issuedQuantity), 2, RoundingMode.HALF_UP)
                    .doubleValue();

            remainingPercent = BigDecimal.valueOf(remainingCount)
                    .multiply(BigDecimal.valueOf(100))
                    .divide(BigDecimal.valueOf(issuedQuantity), 2, RoundingMode.HALF_UP)
                    .doubleValue();
        }

        return PosAvailableDiscountResponse.builder()
                .voucherType("PROMOTION")
                .id(promotion.getId())
                .code(promotion.getCode())
                .name(promotion.getName())
                .discountType(promotion.getDiscountType())
                .discountValue(promotion.getDiscountValue())
                .minOrderValue(promotion.getMinOrderValue())
                .maxDiscountAmount(promotion.getMaxDiscountAmount())
                .issuedQuantity(issuedQuantity)
                .usedCount(usedCount)
                .remainingCount(remainingCount)
                .usedPercent(usedPercent)
                .remainingPercent(remainingPercent)
                .startDate(promotion.getStartDate())
                .endDate(promotion.getEndDate())
                .isActive(promotion.getIsActive())
                .estimatedDiscountAmount(calculateDiscountAmount(
                        subtotal,
                        promotion.getDiscountType(),
                        promotion.getDiscountValue(),
                        promotion.getMaxDiscountAmount()
                ))
                .bestVoucher(false)
                .build();
    }


    private void saveVoucherUsage(Order order, PosCheckoutRequest request) {
        if (request.getCouponId() == null && request.getPromotionId() == null) {
            return;
        }

        CouponUsage.CouponUsageBuilder builder = CouponUsage.builder()
                .customer(order.getCustomer())
                .order(order)
                .usedAt(OffsetDateTime.now());

        if (request.getCouponId() != null) {
            Coupon coupon = couponRepository.findById(request.getCouponId())
                    .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy coupon"));
            builder.coupon(coupon);
        }

        if (request.getPromotionId() != null) {
            Promotion promotion = promotionRepository.findById(request.getPromotionId())
                    .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy chương trình khuyến mãi"));
            builder.promotion(promotion);
        }

        couponUsageRepository.save(builder.build());
    }
}