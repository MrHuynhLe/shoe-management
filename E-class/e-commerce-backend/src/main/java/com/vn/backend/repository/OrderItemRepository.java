package com.vn.backend.repository;

import com.vn.backend.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

    List<OrderItem> findByOrder_Id(Long orderId);

    Optional<OrderItem> findByOrder_IdAndProductVariant_Id(Long orderId, Long productVariantId);
}