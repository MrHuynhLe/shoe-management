package com.vn.backend.service;

import com.vn.backend.dto.request.CouponRequest;
import com.vn.backend.dto.response.CouponResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface CouponService {
    Page<CouponResponse> getAll(Pageable pageable);
    CouponResponse getById(Long id);
    CouponResponse create(CouponRequest request);
    CouponResponse update(Long id, CouponRequest request);
    void delete(Long id);
}