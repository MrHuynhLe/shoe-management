package com.vn.backend.repository;

import com.vn.backend.entity.Cart;
import com.vn.backend.enums.CartStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CartRepository extends JpaRepository<Cart,Long> {
    Optional<Cart> findByCustomerIdAndStatus(Long customerId, CartStatus status);
}