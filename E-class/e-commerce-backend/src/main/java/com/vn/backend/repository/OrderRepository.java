package com.vn.backend.repository;

import com.vn.backend.entity.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    Page<Order> findByCustomer_IdOrderByCreatedAtDesc(Long customerId, Pageable pageable);

    List<Order> findByStatusAndOrderTypeOrderByCreatedAtDesc(String status, String orderType);

    List<Order> findByOrderTypeAndStatusAndCreatedAtBefore(
            String orderType,
            String status,
            OffsetDateTime createdAt
    );
}
