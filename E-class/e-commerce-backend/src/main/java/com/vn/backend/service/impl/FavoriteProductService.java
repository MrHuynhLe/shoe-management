package com.vn.backend.service.impl;

import com.vn.backend.entity.Customer;
import com.vn.backend.entity.FavoriteProduct;
import com.vn.backend.entity.Product;
import com.vn.backend.entity.User;
import com.vn.backend.repository.CustomerRepository;
import com.vn.backend.repository.FavoriteProductRepository;
import com.vn.backend.repository.ProductRepository;
import com.vn.backend.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FavoriteProductService {

    private final FavoriteProductRepository favoriteProductRepository;
    private final CustomerRepository customerRepository;
    private final ProductRepository productRepository;

    @Transactional
    public void addFavorite(CustomUserDetails user, Long productId) {
        Long userProfileId = user.getUserId();

        Customer customer = customerRepository.findByUserProfileId(userProfileId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khách hàng"));

        if (favoriteProductRepository.existsByCustomerIdAndProductId(customer.getId(), productId)) {
            return;
        }

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm"));

        FavoriteProduct favoriteProduct = FavoriteProduct.builder()
                .customer(customer)
                .product(product)
                .build();

        favoriteProductRepository.save(favoriteProduct);
    }

    @Transactional
    public void removeFavorite(CustomUserDetails user, Long productId) {
        Long userProfileId = user.getUserId();

        Customer customer = customerRepository.findByUserProfileId(userProfileId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khách hàng"));

        favoriteProductRepository.deleteByCustomerIdAndProductId(customer.getId(), productId);
    }

    @Transactional(readOnly = true)
    public boolean isFavorite(CustomUserDetails user, Long productId) {
        Long userProfileId = user.getUserId();

        Customer customer = customerRepository.findByUserProfileId(userProfileId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khách hàng"));

        return favoriteProductRepository.existsByCustomerIdAndProductId(customer.getId(), productId);
    }

    @Transactional(readOnly = true)
    public List<FavoriteProduct> getMyFavorites(CustomUserDetails user) {
        Long userProfileId = user.getUserId();

        Customer customer = customerRepository.findByUserProfileId(userProfileId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khách hàng"));

        return favoriteProductRepository.findAllByCustomerIdOrderByCreatedAtDesc(customer.getId());
    }
}