package com.vn.backend.service;

import com.vn.backend.dto.request.CouponRequest;
import com.vn.backend.dto.response.CouponResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface CouponService {
    Page<CouponResponse> getAllCoupons(Pageable pageable);
    List<CouponResponse> getAllActiveCoupons();
    // Còn hiệu lực: active + chưa hết hạn + chưa dùng hết lượt.
    List<CouponResponse> getValidCoupons();
    CouponResponse getCouponById(Long id);
    CouponResponse getCouponByCode(String code);
    List<CouponResponse> searchCoupons(String keyword);
    CouponResponse createCoupon(CouponRequest request);
    CouponResponse updateCoupon(Long id, CouponRequest request);
    void deleteCoupon(Long id);
    // Dùng coupon: tăng usedCount, validate trước khi dùng
    CouponResponse useCoupon(Long id);
}
