package com.vn.backend.service.impl;

import com.vn.backend.dto.request.pos.PosAddItemRequest;
import com.vn.backend.dto.request.pos.PosAssignCustomerRequest;
import com.vn.backend.dto.request.pos.PosCheckoutRequest;
import com.vn.backend.dto.request.pos.PosCreateOrderRequest;
import com.vn.backend.dto.request.pos.PosUpdateItemRequest;
import com.vn.backend.dto.response.pos.PosOrderItemResponse;
import com.vn.backend.dto.response.pos.PosOrderResponse;
import com.vn.backend.dto.response.pos.PosProductSearchResponse;
import com.vn.backend.entity.Customer;
import com.vn.backend.entity.Employee;
import com.vn.backend.entity.InventoryTransaction;
import com.vn.backend.entity.Order;
import com.vn.backend.entity.OrderItem;
import com.vn.backend.entity.Payment;
import com.vn.backend.entity.PaymentMethod;
import com.vn.backend.entity.ProductImage;
import com.vn.backend.entity.ProductVariant;
import com.vn.backend.entity.Store;
import com.vn.backend.repository.CustomerRepository;
import com.vn.backend.repository.EmployeeRepository;
import com.vn.backend.repository.InventoryTransactionRepository;
import com.vn.backend.repository.OrderItemRepository;
import com.vn.backend.repository.OrderRepository;
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

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class PosServiceImpl implements PosService {

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

    @Override
    public PosOrderResponse createOrder(PosCreateOrderRequest request) {
        if (request.getEmployeeId() == null) {
            throw new IllegalArgumentException("employeeId không được để trống");
        }
        if (request.getStoreId() == null) {
            throw new IllegalArgumentException("storeId không được để trống");
        }

        Employee employee = employeeRepository.findById(toLong(request.getEmployeeId()))
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy nhân viên"));

        Store store = storeRepository.findById(toLong(request.getStoreId()))
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy cửa hàng"));

        Customer customer = null;
        if (request.getCustomerId() != null) {
            customer = customerRepository.findById(toLong(request.getCustomerId()))
                    .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy khách hàng"));
        }

        Order order = new Order();
        order.setCode(generateOrderCode());
        order.setEmployee(employee);
        order.setStore(store);
        order.setCustomer(customer);
        order.setStatus("DRAFT");
        order.setOrderType("POS");
        order.setNote(request.getNote());
        order.setDiscountAmount(BigDecimal.ZERO);
        order.setTotalAmount(BigDecimal.ZERO);
        order.setCustomerPaid(BigDecimal.ZERO);
        order.setCreatedAt(OffsetDateTime.now());

        orderRepository.save(order);
        return mapOrderResponse(order);
    }

    @Override
    @Transactional(readOnly = true)
    public PosOrderResponse getOrder(Long orderId) {
        Order order = getOrderDraftOrCompleted(orderId);
        return mapOrderResponse(order);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PosOrderResponse> getDraftOrders() {
        return orderRepository.findByStatusOrderByCreatedAtDesc("DRAFT")
                .stream()
                .filter(order -> "POS".equalsIgnoreCase(order.getOrderType()))
                .map(this::mapOrderResponse)
                .toList();
    }

    @Override
    public PosOrderResponse addItem(Long orderId, PosAddItemRequest request) {
        if (request.getProductVariantId() == null) {
            throw new IllegalArgumentException("productVariantId không được để trống");
        }
        if (request.getQuantity() == null || request.getQuantity() <= 0) {
            throw new IllegalArgumentException("quantity phải lớn hơn 0");
        }

        return addItemInternal(orderId, request.getProductVariantId(), request.getQuantity());
    }

    @Override
    public PosOrderResponse addItem(Long orderId, Long variantId) {
        return addItemInternal(orderId, variantId, 1);
    }

    private PosOrderResponse addItemInternal(Long orderId, Long variantId, Integer quantity) {
        Order order = getDraftOrder(orderId);

        ProductVariant variant = productVariantRepository.findByIdForUpdate(variantId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy biến thể sản phẩm"));

        if (variant.getStockQuantity() == null || variant.getStockQuantity() <= 0) {
            throw new IllegalStateException("Sản phẩm đã hết hàng");
        }

        OrderItem item = orderItemRepository
                .findByOrder_IdAndProductVariant_Id(order.getId(), variant.getId())
                .orElse(null);

        int currentQty = item != null ? item.getQuantity() : 0;
        int newQty = currentQty + quantity;

        if (newQty > variant.getStockQuantity()) {
            throw new IllegalStateException("Số lượng vượt quá tồn kho");
        }

        if (item == null) {
            item = new OrderItem();
            item.setOrder(order);
            item.setProductVariant(variant);
            item.setQuantity(quantity);
            item.setPriceAtPurchase(safe(variant.getSellingPrice()));
            item.setCostPriceAtPurchase(safe(variant.getCostPrice()));
        } else {
            item.setQuantity(newQty);
        }

        orderItemRepository.save(item);
        recalculateOrder(order);
        return mapOrderResponse(order);
    }

    @Override
    public PosOrderResponse updateItem(Long itemId, PosUpdateItemRequest request) {
        OrderItem item = orderItemRepository.findById(itemId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy dòng sản phẩm"));

        Order order = getDraftOrder(item.getOrder().getId());

        ProductVariant variant = productVariantRepository.findByIdForUpdate(item.getProductVariant().getId())
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy biến thể sản phẩm"));

        if (request.getQuantity() == null || request.getQuantity() <= 0) {
            throw new IllegalArgumentException("Số lượng phải lớn hơn 0");
        }

        if (variant.getStockQuantity() == null || request.getQuantity() > variant.getStockQuantity()) {
            throw new IllegalStateException("Số lượng vượt quá tồn kho");
        }

        item.setQuantity(request.getQuantity());
        orderItemRepository.save(item);

        recalculateOrder(order);
        return mapOrderResponse(order);
    }

    @Override
    public void removeItem(Long itemId) {
        OrderItem item = orderItemRepository.findById(itemId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy dòng sản phẩm"));

        Order order = getDraftOrder(item.getOrder().getId());
        orderItemRepository.delete(item);
        recalculateOrder(order);
    }

    @Override
    public PosOrderResponse assignCustomer(Long orderId, PosAssignCustomerRequest request) {
        Order order = getDraftOrder(orderId);

        if (request == null || request.getCustomerId() == null) {
            order.setCustomer(null);
        } else {
            Customer customer = customerRepository.findById(toLong(request.getCustomerId()))
                    .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy khách hàng"));
            order.setCustomer(customer);
        }

        orderRepository.save(order);
        return mapOrderResponse(order);
    }

    @Override
    public PosOrderResponse checkout(Long orderId, PosCheckoutRequest request) {
        Order order = getDraftOrder(orderId);
        List<OrderItem> items = orderItemRepository.findByOrder_Id(order.getId());

        if (items.isEmpty()) {
            throw new IllegalStateException("Đơn hàng chưa có sản phẩm");
        }

        if (request.getPaymentMethodId() == null) {
            throw new IllegalArgumentException("paymentMethodId không được để trống");
        }

        PaymentMethod paymentMethod = paymentMethodRepository.findById(toLong(request.getPaymentMethodId()))
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy phương thức thanh toán"));

        recalculateOrder(order);

        BigDecimal finalAmount = safe(order.getTotalAmount()).subtract(safe(order.getDiscountAmount()));
        BigDecimal customerPaid = BigDecimal.valueOf(
                request.getCustomerPaid() == null ? 0D : request.getCustomerPaid()
        );

        if (customerPaid.compareTo(finalAmount) < 0) {
            throw new IllegalStateException("Số tiền khách trả chưa đủ");
        }

        for (OrderItem item : items) {
            ProductVariant variant = productVariantRepository.findByIdForUpdate(item.getProductVariant().getId())
                    .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy sản phẩm"));

            if (variant.getStockQuantity() == null || variant.getStockQuantity() < item.getQuantity()) {
                throw new IllegalStateException("Sản phẩm " + variant.getCode() + " không đủ tồn kho");
            }

            InventoryTransaction tx = new InventoryTransaction();
            tx.setReferenceCode(generateInventoryCode());
            tx.setProductVariant(variant);
            tx.setStore(order.getStore());
            tx.setQuantity(item.getQuantity());
            tx.setTransactionType("OUT");
            tx.setCreatedAt(LocalDateTime.now());

            inventoryTransactionRepository.save(tx);
        }

        Payment payment = new Payment();
        payment.setOrder(order);
        payment.setPaymentMethod(paymentMethod);
        payment.setAmount(finalAmount);
        payment.setStatus("PAID");
        paymentRepository.save(payment);

        order.setCustomerPaid(customerPaid);
        order.setNote(request.getNote() != null ? request.getNote() : order.getNote());
        order.setStatus("COMPLETED");
        orderRepository.save(order);

        return mapOrderResponse(order);
    }

    @Override
    public PosOrderResponse cancel(Long orderId) {
        Order order = getDraftOrder(orderId);
        order.setStatus("CANCELLED");
        orderRepository.save(order);
        return mapOrderResponse(order);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PosProductSearchResponse> searchProducts(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return List.of();
        }

        return productVariantRepository.searchForPos(keyword.trim())
                .stream()
                .map(variant -> PosProductSearchResponse.builder()
                        .variantId(toInteger(variant.getId()))
                        .variantCode(variant.getCode())
                        .barcode(variant.getBarcode())
                        .productCode(variant.getProduct().getCode())
                        .productName(variant.getProduct().getName())
                        .sellingPrice(toDouble(variant.getSellingPrice()))
                        .stockQuantity(variant.getStockQuantity())
                        .imageUrl(getImageUrl(variant))
                        .build())
                .toList();
    }

    private Order getDraftOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy đơn hàng"));

        if (!"DRAFT".equalsIgnoreCase(order.getStatus())) {
            throw new IllegalStateException("Chỉ thao tác được với đơn nháp");
        }

        if (!"POS".equalsIgnoreCase(order.getOrderType())) {
            throw new IllegalStateException("Đây không phải đơn POS");
        }

        return order;
    }

    private Order getOrderDraftOrCompleted(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy đơn hàng"));

        if (!"POS".equalsIgnoreCase(order.getOrderType())) {
            throw new IllegalStateException("Đây không phải đơn POS");
        }

        return order;
    }

    private void recalculateOrder(Order order) {
        List<OrderItem> items = orderItemRepository.findByOrder_Id(order.getId());

        BigDecimal total = items.stream()
                .map(i -> safe(i.getPriceAtPurchase()).multiply(BigDecimal.valueOf(i.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        order.setTotalAmount(total);

        if (order.getDiscountAmount() == null) {
            order.setDiscountAmount(BigDecimal.ZERO);
        }

        orderRepository.save(order);
    }

    private PosOrderResponse mapOrderResponse(Order order) {
        List<OrderItem> items = orderItemRepository.findByOrder_Id(order.getId());

        List<PosOrderItemResponse> itemResponses = items.stream()
                .map(item -> {
                    ProductVariant variant = item.getProductVariant();
                    BigDecimal lineTotal = safe(item.getPriceAtPurchase())
                            .multiply(BigDecimal.valueOf(item.getQuantity()));

                    return PosOrderItemResponse.builder()
                            .itemId(toInteger(item.getId()))
                            .variantId(toInteger(variant.getId()))
                            .variantCode(variant.getCode())
                            .barcode(variant.getBarcode())
                            .productName(variant.getProduct().getName())
                            .price(toDouble(item.getPriceAtPurchase()))
                            .quantity(item.getQuantity())
                            .lineTotal(toDouble(lineTotal))
                            .stockQuantity(variant.getStockQuantity())
                            .imageUrl(getImageUrl(variant))
                            .build();
                })
                .toList();

        BigDecimal totalAmount = safe(order.getTotalAmount());
        BigDecimal discountAmount = safe(order.getDiscountAmount());
        BigDecimal finalAmount = totalAmount.subtract(discountAmount);
        BigDecimal customerPaid = safe(order.getCustomerPaid());
        BigDecimal changeAmount = customerPaid.subtract(finalAmount);

        if (changeAmount.compareTo(BigDecimal.ZERO) < 0) {
            changeAmount = BigDecimal.ZERO;
        }

        String customerName = null;
        Integer customerId = null;
        if (order.getCustomer() != null) {
            customerId = toInteger(order.getCustomer().getId());
            if (order.getCustomer().getUserProfile() != null) {
                customerName = order.getCustomer().getUserProfile().getFullName();
            }
        }

        return PosOrderResponse.builder()
                .orderId(toInteger(order.getId()))
                .orderCode(order.getCode())
                .status(order.getStatus())
                .customerId(customerId)
                .customerName(customerName)
                .employeeId(order.getEmployee() != null ? toInteger(order.getEmployee().getId()) : null)
                .storeId(order.getStore() != null ? toInteger(order.getStore().getId()) : null)
                .totalAmount(toDouble(totalAmount))
                .discountAmount(toDouble(discountAmount))
                .finalAmount(toDouble(finalAmount))
                .customerPaid(toDouble(customerPaid))
                .changeAmount(toDouble(changeAmount))
                .orderType(order.getOrderType())
                .note(order.getNote())
                .items(itemResponses)
                .build();
    }

    private String getImageUrl(ProductVariant variant) {
        return productImageRepository.findFirstByProductVariant_IdOrderByIsPrimaryDescDisplayOrderAsc(variant.getId())
                .map(ProductImage::getImageUrl)
                .orElseGet(() -> productImageRepository
                        .findFirstByProduct_IdOrderByIsPrimaryDescDisplayOrderAsc(variant.getProduct().getId())
                        .map(ProductImage::getImageUrl)
                        .orElse(null));
    }

    private String generateOrderCode() {
        return "POS-" + System.currentTimeMillis();
    }

    private String generateInventoryCode() {
        return "PX-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    private BigDecimal safe(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }

    private Double toDouble(BigDecimal value) {
        return safe(value).doubleValue();
    }

    private Long toLong(Integer value) {
        return value == null ? null : value.longValue();
    }

    private Integer toInteger(Long value) {
        return value == null ? null : value.intValue();
    }
}