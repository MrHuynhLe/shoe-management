package com.vn.backend.service;

import com.vn.backend.dto.request.ShippingProviderRequest;
import com.vn.backend.dto.response.ShippingProviderResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

public interface ShippingProviderService {
    Page<ShippingProviderResponse> getAllShippingProviders(Pageable pageable);
    List<ShippingProviderResponse> getAllActiveShippingProviders();
    ShippingProviderResponse getShippingProviderById(Long id);
    ShippingProviderResponse createShippingProvider(ShippingProviderRequest request);
    ShippingProviderResponse updateShippingProvider(Long id, ShippingProviderRequest request);
    void deleteShippingProvider(Long id);
}