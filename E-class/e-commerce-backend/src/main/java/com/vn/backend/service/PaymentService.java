package com.vn.backend.service;

import com.vn.backend.dto.request.PaymentRequest;
import com.vn.backend.dto.response.PaymentResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface PaymentService {
    Page<PaymentResponse> getAll(Pageable pageable);
    PaymentResponse getById(Long id);
    PaymentResponse create(PaymentRequest request);
    PaymentResponse update(Long id, PaymentRequest request);
    void delete(Long id);
}