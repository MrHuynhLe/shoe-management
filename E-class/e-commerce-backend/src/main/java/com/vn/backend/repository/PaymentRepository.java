package com.vn.backend.repository;

import com.vn.backend.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findByOrder_Id(Long orderId);

    Optional<Payment> findByProviderTxnRef(String providerTxnRef);

    boolean existsByProviderTxnRef(String providerTxnRef);
}