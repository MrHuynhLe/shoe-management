package com.vn.backend.service.impl;

import com.vn.backend.dto.request.AddCartRequest;
import com.vn.backend.dto.response.CartResponse;
import com.vn.backend.dto.response.OrderResponse; // Giả định bạn đã có class này
import com.vn.backend.entity.Cart;
import com.vn.backend.entity.CartItem;
import com.vn.backend.entity.Customer;
import com.vn.backend.entity.ProductVariant;
import com.vn.backend.enums.CartStatus;
import com.vn.backend.repository.CartItemRepository;
import com.vn.backend.repository.CartRepository;
import com.vn.backend.repository.CustomerRepository;
import com.vn.backend.repository.ProductVariantRepository;
import com.vn.backend.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class CartServiceImpl implements CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final CustomerRepository customerRepository;
    private final ProductVariantRepository productVariantRepository;

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

        cart.setStatus(CartStatus.ORDERED);
        cartRepository.save(cart);

        return new OrderResponse();
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