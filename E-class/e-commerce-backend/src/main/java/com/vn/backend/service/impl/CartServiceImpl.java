package com.vn.backend.service.impl;

import com.vn.backend.dto.request.AddCartRequest;
import com.vn.backend.dto.response.CartItemResponse;
import com.vn.backend.dto.response.CartResponse;
import com.vn.backend.dto.response.OrderResponse;
import com.vn.backend.entity.Cart;
import com.vn.backend.entity.CartItem;
import com.vn.backend.entity.ProductVariant;
import com.vn.backend.enums.CartStatus;
import com.vn.backend.repository.CartItemRepository;
import com.vn.backend.repository.CartRepository;
import com.vn.backend.repository.ProductVariantRepository;
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

    // =========================
    // ADD TO CART
    // =========================
    @Override
    public CartResponse addToCart(Long userId, AddCartRequest request) {

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

    // =========================
    // GET CART
    // =========================
    @Override
    @Transactional(readOnly = true)
    public CartResponse getActiveCart(Long userId) {

        Cart cart = cartRepository
                .findByCustomerIdAndStatus(userId, CartStatus.ACTIVE)
                .orElseGet(() -> createNewCart(userId));

        return mapToCartResponse(cart);
    }

    // =========================
    // UPDATE QUANTITY
    // =========================
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

    // =========================
    // REMOVE ITEM
    // =========================
    @Override
    public CartResponse removeItem(Long userId, Long cartItemId) {

        CartItem item = getCartItemOwnedByUser(userId, cartItemId);

        Cart cart = item.getCart();
        cartItemRepository.delete(item);

        return mapToCartResponse(cart);
    }

    // =========================
    // CLEAR CART
    // =========================
    @Override
    public void clearCart(Long userId) {

        Cart cart = cartRepository
                .findByCustomerIdAndStatus(userId, CartStatus.ACTIVE)
                .orElseThrow(() -> new IllegalArgumentException("Active cart not found"));

        cartItemRepository.deleteAllByCartId(cart.getId());
    }

    // =========================
    // CHECKOUT
    // =========================
    @Override
    public OrderResponse checkout(Long userId) {

        Cart cart = cartRepository
                .findByCustomerIdAndStatus(userId, CartStatus.ACTIVE)
                .orElseThrow(() -> new IllegalArgumentException("Nothing to checkout"));

        if (cart.getItems() == null || cart.getItems().isEmpty()) {
            throw new IllegalArgumentException("Cart is empty");
        }

        // Validate stock again before checkout
        for (CartItem item : cart.getItems()) {
            if (item.getQuantity() > item.getProductVariant().getStockQuantity()) {
                throw new IllegalArgumentException(
                        "Product " + item.getProductVariant().getCode() + " is out of stock");
            }
        }

        cart.setStatus(CartStatus.ORDERED);
        cart.setUpdatedAt(OffsetDateTime.now());
        cartRepository.save(cart);

        // TODO: Create Order entity here

        return new OrderResponse();
    }

    // =========================
    // PRIVATE HELPERS
    // =========================

    private Cart getOrCreateActiveCart(Long userId) {
        return cartRepository
                .findByCustomerIdAndStatus(userId, CartStatus.ACTIVE)
                .orElseGet(() -> createNewCart(userId));
    }

    private Cart createNewCart(Long userId) {
        Cart cart = new Cart();
        cart.setCustomerId(userId);
        cart.setStatus(CartStatus.ACTIVE);
        cart.setCreatedAt(OffsetDateTime.now());
        return cartRepository.save(cart);
    }

    private ProductVariant getVariantOrThrow(Long variantId) {
        return productVariantRepository.findById(variantId)
                .orElseThrow(() -> new IllegalArgumentException("Product variant not found"));
    }

    private CartItem getCartItemOwnedByUser(Long userId, Long cartItemId) {

        CartItem item = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new IllegalArgumentException("Cart item not found"));

        if (!item.getCart().getCustomerId().equals(userId)) {
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
        resp.setCustomerId(cart.getCustomerId());
        resp.setStatus(cart.getStatus() != null ? cart.getStatus().name() : null);

        List<CartItemResponse> itemResponses = new ArrayList<>();

        BigDecimal totalAmount = BigDecimal.ZERO;
        int totalItems = 0;

        if (cart.getItems() != null) {

            for (CartItem item : cart.getItems()) {

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
        }

        resp.setItems(itemResponses);
        resp.setTotalAmount(totalAmount);
        resp.setTotalItems(totalItems);

        return resp;
    }
}