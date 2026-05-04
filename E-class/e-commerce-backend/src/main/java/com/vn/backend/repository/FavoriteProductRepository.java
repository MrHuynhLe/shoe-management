package com.vn.backend.repository;

import com.vn.backend.entity.FavoriteProduct;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FavoriteProductRepository extends JpaRepository<FavoriteProduct, Long> {

    boolean existsByCustomerIdAndProductId(Long customerId, Long productId);

    Optional<FavoriteProduct> findByCustomerIdAndProductId(Long customerId, Long productId);

    List<FavoriteProduct> findAllByCustomerIdOrderByCreatedAtDesc(Long customerId);

    void deleteByCustomerIdAndProductId(Long customerId, Long productId);
}