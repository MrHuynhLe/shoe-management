package com.vn.backend.service.impl;

import com.vn.backend.dto.request.AddCartRequest;
import com.vn.backend.dto.response.CartResponse;
import com.vn.backend.dto.response.OrderResponse;
import com.vn.backend.entity.*;
import com.vn.backend.enums.CartStatus;
import com.vn.backend.enums.OrderStatus;
import com.vn.backend.mapper.OrderMapper;
import com.vn.backend.repository.*;
import com.vn.backend.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class CartServiceImpl implements CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final CustomerRepository customerRepository;
    private final ProductVariantRepository productVariantRepository;
    private final OrderRepository orderRepository;
    private final OrderMapper orderMapper;

    @Override
    public CartResponse addToCart(AddCartRequest request) {
        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new IllegalArgumentException("Customer not found"));

        Cart cart = cartRepository.findByCustomerIdAndStatus(customer.getId(), CartStatus.ACTIVE)
                .orElseGet(() -> {
                    Cart c = new Cart();
                    c.setCustomerId(customer.getId());
                    c.setStatus(CartStatus.ACTIVE);
                    return cartRepository.save(c);
                });

        ProductVariant variant = productVariantRepository.findById(request.getProductVariantId())
                .orElseThrow(() -> new IllegalArgumentException("Product variant not found"));

        Optional<CartItem> existing = cartItemRepository.findByCartIdAndProductVariantId(cart.getId(), variant.getId());

        CartItem item;
        if (existing.isPresent()) {
            item = existing.get();
            item.setQuantity(item.getQuantity() + request.getQuantity());
        } else {
            item = new CartItem();
            item.setCart(cart);
            item.setProductVariantId(variant.getId());
            item.setQuantity(request.getQuantity());
            item.setCreatedAt(OffsetDateTime.now());
        }
        cartItemRepository.save(item);

        return mapToCartResponse(cart);
    }

    @Override
    @Transactional(readOnly = true)
    public CartResponse getActiveCart(Long customerId) {
        Cart cart = cartRepository.findByCustomerIdAndStatus(customerId, CartStatus.ACTIVE)
                .orElseThrow(() -> new IllegalArgumentException("Active cart not found"));
        return mapToCartResponse(cart);
    }

    @Override
    public CartResponse updateQuantity(Long cartItemId, int quantity) {
        CartItem item = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new IllegalArgumentException("Cart item not found"));

        if (quantity <= 0) {
            cartItemRepository.delete(item);
        } else {
            item.setQuantity(quantity);
            cartItemRepository.save(item);
        }

        return mapToCartResponse(item.getCart());
    }

    @Override
    public CartResponse removeItem(Long cartItemId) {
        CartItem item = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new IllegalArgumentException("Cart item not found"));

        Cart cart = item.getCart();
        cartItemRepository.delete(item);

        return mapToCartResponse(cart);
    }

    @Override
    public void clearCart(Long customerId) {
        Cart cart = cartRepository.findByCustomerIdAndStatus(customerId, CartStatus.ACTIVE)
                .orElseThrow(() -> new IllegalArgumentException("Active cart not found"));

        cartItemRepository.deleteAllByCartId(cart.getId());
    }

    @Override
    public OrderResponse checkout(Long customerId) {
        Cart cart = cartRepository.findByCustomerIdAndStatus(customerId, CartStatus.ACTIVE)
                .orElseThrow(() -> new IllegalArgumentException("Nothing to checkout"));

        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new IllegalArgumentException("Customer not found"));

        List<CartItem> cartItems = cart.getItems();
        if (cartItems == null || cartItems.isEmpty()) {
            throw new IllegalArgumentException("Cart is empty");
        }

        String code = "ORD-" + System.currentTimeMillis();

        Order order = Order.builder()
                .code(code)
                .customer(customer)
                .status(OrderStatus.PENDING.name())
                .discountAmount(BigDecimal.ZERO)
                .paymentMethod("COD")
                .build();

        BigDecimal totalAmount = BigDecimal.ZERO;
        List<OrderItem> orderItems = new ArrayList<>();

        for (CartItem ci : cartItems) {
            ProductVariant variant = productVariantRepository.findById(ci.getProductVariantId())
                    .orElseThrow(() -> new IllegalArgumentException("Product variant not found"));

            BigDecimal unitPrice = variant.getSellingPrice();
            BigDecimal lineTotal = unitPrice.multiply(BigDecimal.valueOf(ci.getQuantity()));

            String variantInfo = "";
            if (variant.getVariantAttributeValues() != null) {
                variantInfo = variant.getVariantAttributeValues().stream()
                        .map(av -> av.getAttributeValue().getAttribute().getCode()
                                + ": " + av.getAttributeValue().getValue())
                        .collect(Collectors.joining(", "));
            }

            String imageUrl = null;
            if (variant.getImages() != null && !variant.getImages().isEmpty()) {
                imageUrl = variant.getImages().get(0).getImageUrl();
            } else if (variant.getProduct().getImages() != null && !variant.getProduct().getImages().isEmpty()) {
                imageUrl = variant.getProduct().getImages().get(0).getImageUrl();
            }

            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .productVariant(variant)
                    .productName(variant.getProduct().getName())
                    .variantInfo(variantInfo)
                    .imageUrl(imageUrl)
                    .quantity(ci.getQuantity())
                    .unitPrice(unitPrice)
                    .totalPrice(lineTotal)
                    .build();

            orderItems.add(orderItem);
            totalAmount = totalAmount.add(lineTotal);
        }

        order.setOrderItems(orderItems);
        order.setTotalAmount(totalAmount);

        if (customer.getUserProfile() != null) {
            order.setShippingName(customer.getUserProfile().getFullName());
            order.setShippingPhone(customer.getUserProfile().getPhone());
            order.setShippingAddress(customer.getUserProfile().getAddress());
        }

        orderRepository.save(order);

        cart.setStatus(CartStatus.ORDERED);
        cartRepository.save(cart);

        return orderMapper.toOrderResponse(order);
    }

    private CartResponse mapToCartResponse(Cart cart) {
        CartResponse resp = new CartResponse();
        resp.setCartId(cart.getId());
        resp.setCustomerId(cart.getCustomerId());
        resp.setStatus(cart.getStatus() != null ? cart.getStatus().name() : null);

        int itemsCount = (cart.getItems() != null) ? cart.getItems().size() : 0;
        resp.setTotal(BigDecimal.valueOf(itemsCount));

        return resp;
    }
}