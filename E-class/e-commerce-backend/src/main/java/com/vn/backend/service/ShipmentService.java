package com.vn.backend.service;

import com.vn.backend.dto.request.ShipmentRequest;
import com.vn.backend.dto.response.ShipmentResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ShipmentService {
    Page<ShipmentResponse> getAll(Pageable pageable);
    ShipmentResponse getById(Long id);
    ShipmentResponse create(ShipmentRequest request);
    ShipmentResponse update(Long id, ShipmentRequest request);
    void delete(Long id);
}