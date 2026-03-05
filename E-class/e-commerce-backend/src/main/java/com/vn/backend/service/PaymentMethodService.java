package com.vn.backend.service;

import com.vn.backend.dto.request.PaymentMethodRequest;
import com.vn.backend.dto.response.PaymentMethodResponse;

import java.util.List;

public interface PaymentMethodService {
    List<PaymentMethodResponse> getAll();
    PaymentMethodResponse create(PaymentMethodRequest request);
    PaymentMethodResponse update(Long id, PaymentMethodRequest request);
    void delete(Long id);
}