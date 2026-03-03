package com.vn.backend.repository;

import com.vn.backend.entity.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {

    Optional<CartItem> findByCartIdAndProductVariantId(Long cartId, Long variantId);

    List<CartItem> findByCartId(Long cartId);

    @Modifying
    @Transactional
    void deleteAllByCartId(Long cartId);
}