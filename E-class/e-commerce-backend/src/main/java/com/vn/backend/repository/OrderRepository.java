package com.vn.backend.repository;

import com.vn.backend.entity.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {

    Page<Order> findAllByOrderByCreatedAtDesc(Pageable pageable);

    Page<Order> findByStatusOrderByCreatedAtDesc(String status, Pageable pageable);

    Page<Order> findByCustomer_IdOrderByCreatedAtDesc(Long customerId, Pageable pageable);

    @EntityGraph(attributePaths = {"orderItems", "customer", "customer.userProfile"})
    Optional<Order> findWithDetailsById(Long id);

    @Query("SELECT o FROM Order o LEFT JOIN o.customer c LEFT JOIN c.userProfile up " +
           "WHERE (:keyword IS NULL OR o.code LIKE %:keyword% OR up.fullName LIKE %:keyword%) " +
           "AND (:status IS NULL OR o.status = :status) " +
           "ORDER BY o.createdAt DESC")
    Page<Order> searchOrders(@Param("keyword") String keyword,
                             @Param("status") String status,
                             Pageable pageable);
}
