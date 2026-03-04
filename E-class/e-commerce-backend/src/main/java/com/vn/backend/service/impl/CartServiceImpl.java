package com.vn.backend.service.impl;

import com.vn.backend.dto.request.AddCartRequest;
import com.vn.backend.dto.response.CartItemResponse;
import com.vn.backend.dto.response.CartResponse;
import com.vn.backend.dto.response.OrderResponse;
import com.vn.backend.entity.*;
import com.vn.backend.enums.CartStatus;
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

@Service
@RequiredArgsConstructor
@Transactional
public class CartServiceImpl implements CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductVariantRepository productVariantRepository;
    private final CustomerRepository customerRepository;
    private final UserRepository userRepository;


    @Override
    public CartResponse addToCart(Long userId, AddCartRequest request) {
        System.out.println("Variant ID: " + request.getProductVariantId());
        validateQuantity(request.getQuantity());

        Cart cart = getOrCreateActiveCart(userId);

        ProductVariant variant = getVariantOrThrow(request.getProductVariantId());
        validateVariantAvailable(variant);

        Optional<CartItem> existing =
                cartItemRepository.findByCartIdAndProductVariantId(cart.getId(), variant.getId());

        CartItem item;

        if (existing.isPresent()) {

            item = existing.get();
            int newQuantity = item.getQuantity() + request.getQuantity();

            if (newQuantity > variant.getStockQuantity()) {
                throw new IllegalArgumentException("Quantity exceeds stock");
            }

            item.setQuantity(newQuantity);
            item.setUpdatedAt(OffsetDateTime.now());

        } else {

            if (request.getQuantity() > variant.getStockQuantity()) {
                throw new IllegalArgumentException("Quantity exceeds stock");
            }

            item = new CartItem();
            item.setCart(cart);
            item.setProductVariant(variant);
            item.setQuantity(request.getQuantity());
            item.setCreatedAt(OffsetDateTime.now());
        }

        cartItemRepository.save(item);

        return mapToCartResponse(cart);

    }

    @Override
    public CartResponse getActiveCart(Long userId) {
        Cart cart = getOrCreateActiveCart(userId);
        return mapToCartResponse(cart);
    }

    @Override
    public CartResponse updateQuantity(Long userId, Long cartItemId, int quantity) {

        CartItem item = getCartItemOwnedByUser(userId, cartItemId);
        ProductVariant variant = item.getProductVariant();

        if (quantity <= 0) {
            cartItemRepository.delete(item);
            return mapToCartResponse(item.getCart());
        }

        if (quantity > variant.getStockQuantity()) {
            throw new IllegalArgumentException("Quantity exceeds stock");
        }

        item.setQuantity(quantity);
        item.setUpdatedAt(OffsetDateTime.now());

        return mapToCartResponse(item.getCart());
    }


    @Override
    public CartResponse removeItem(Long userId, Long cartItemId) {

        CartItem item = getCartItemOwnedByUser(userId, cartItemId);
        Cart cart = item.getCart();

        cartItemRepository.delete(item);

        return mapToCartResponse(cart);
    }


    @Override
    public void clearCart(Long userId) {

        Customer customer = resolveCustomer(userId);

        Cart cart = cartRepository
                .findByCustomerIdAndStatus(customer.getId(), CartStatus.ACTIVE)
                .orElseThrow(() -> new IllegalArgumentException("Active cart not found"));

        cartItemRepository.deleteAllByCartId(cart.getId());
    }


    @Override
    public OrderResponse checkout(Long userId) {

        Customer customer = resolveCustomer(userId);

        Cart cart = cartRepository
                .findByCustomerIdAndStatus(customer.getId(), CartStatus.ACTIVE)
                .orElseThrow(() -> new IllegalArgumentException("Nothing to checkout"));

        if (cart.getItems() == null || cart.getItems().isEmpty()) {
            throw new IllegalArgumentException("Cart is empty");
        }

        for (CartItem item : cart.getItems()) {
            if (item.getQuantity() > item.getProductVariant().getStockQuantity()) {
                throw new IllegalArgumentException(
                        "Product " + item.getProductVariant().getCode() + " is out of stock");
            }
        }

        cart.setStatus(CartStatus.ORDERED);
        cart.setUpdatedAt(OffsetDateTime.now());
        cartRepository.save(cart);

        return new OrderResponse();
    }



    private Cart getOrCreateActiveCart(Long userId) {

        Customer customer = resolveCustomer(userId);

        return cartRepository
                .findByCustomerIdAndStatus(customer.getId(), CartStatus.ACTIVE)
                .orElseGet(() -> createNewCart(customer));
    }

    private Cart createNewCart(Customer customer) {

        Cart cart = new Cart();
        cart.setCustomer(customer);
        cart.setStatus(CartStatus.ACTIVE);
        cart.setCreatedAt(OffsetDateTime.now());

        return cartRepository.save(cart);
    }

    private Customer resolveCustomer(Long userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        return customerRepository
                .findByUserProfileId(user.getUserProfile().getId())
                .orElseThrow(() -> new IllegalArgumentException("Customer not found"));
    }

    private ProductVariant getVariantOrThrow(Long variantId) {
        return productVariantRepository.findById(variantId)
                .orElseThrow(() -> new IllegalArgumentException("Product variant not found"));
    }

    private CartItem getCartItemOwnedByUser(Long userId, Long cartItemId) {

        Customer customer = resolveCustomer(userId);

        CartItem item = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new IllegalArgumentException("Cart item not found"));

        if (!item.getCart().getCustomer().getId().equals(customer.getId())) {
            throw new RuntimeException("Access denied");
        }

        return item;
    }

    private void validateVariantAvailable(ProductVariant variant) {

        if (!Boolean.TRUE.equals(variant.getIsActive()) || variant.getDeletedAt() != null) {
            throw new IllegalArgumentException("Product variant is not available");
        }

        if (variant.getStockQuantity() == null || variant.getStockQuantity() <= 0) {
            throw new IllegalArgumentException("Product is out of stock");
        }
    }

    private void validateQuantity(int quantity) {
        if (quantity <= 0) {
            throw new IllegalArgumentException("Quantity must be greater than 0");
        }
    }

    private CartResponse mapToCartResponse(Cart cart) {

        CartResponse resp = new CartResponse();
        resp.setCartId(cart.getId());
        resp.setCustomerId(cart.getCustomer().getId());
        resp.setStatus(cart.getStatus().name());

        List<CartItemResponse> itemResponses = new ArrayList<>();
        BigDecimal totalAmount = BigDecimal.ZERO;
        int totalItems = 0;

        List<CartItem> items = cartItemRepository.findByCartId(cart.getId());

        for (CartItem item : items) {

            ProductVariant variant = item.getProductVariant();

            CartItemResponse itemResp = new CartItemResponse();
            itemResp.setCartItemId(item.getId());
            itemResp.setVariantId(variant.getId());
            itemResp.setProductName(variant.getProduct().getName());
            itemResp.setVariantCode(variant.getCode());
            itemResp.setPrice(variant.getSellingPrice());
            itemResp.setQuantity(item.getQuantity());
            itemResp.setStockRemaining(variant.getStockQuantity());

            BigDecimal subTotal =
                    variant.getSellingPrice()
                            .multiply(BigDecimal.valueOf(item.getQuantity()));

            itemResp.setSubTotal(subTotal);

            totalAmount = totalAmount.add(subTotal);
            totalItems += item.getQuantity();

            itemResponses.add(itemResp);
        }

        resp.setItems(itemResponses);
        resp.setTotalAmount(totalAmount);
        resp.setTotalItems(totalItems);

        return resp;
    }
}