package com.vn.backend.service.impl;

import com.vn.backend.dto.request.CouponRequest;
import com.vn.backend.dto.response.CouponResponse;
import com.vn.backend.entity.Coupon;
import com.vn.backend.repository.CouponRepository;
import com.vn.backend.service.CouponService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CouponServiceImpl implements CouponService {
//iml
    private final CouponRepository couponRepository;

    @Override
    public Page<CouponResponse> getAllCoupons(Pageable pageable) {
        return couponRepository.findAll(pageable).map(this::mapToResponse);
    }

    @Override
    public List<CouponResponse> getAllActiveCoupons() {
        return couponRepository.findAllActive().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<CouponResponse> getValidCoupons() {
        return couponRepository.findValid(LocalDateTime.now()).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public CouponResponse getCouponById(Long id) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Coupon not found with id: " + id));
        return mapToResponse(coupon);
    }

    @Override
    public CouponResponse getCouponByCode(String code) {
        Coupon coupon = couponRepository.findByCode(code)
                .orElseThrow(() -> new RuntimeException("Coupon not found with code: " + code));
        return mapToResponse(coupon);
    }

    @Override
    public List<CouponResponse> searchCoupons(String keyword) {
        return couponRepository.searchByKeyword(keyword).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public CouponResponse createCoupon(CouponRequest request) {
        if (couponRepository.findByCode(request.getCode()).isPresent()) {
            throw new RuntimeException("Coupon code already exists: " + request.getCode());
        }
        Coupon coupon = mapFromRequest(request);
        return mapToResponse(couponRepository.save(coupon));
    }

    @Override
    @Transactional
    public CouponResponse updateCoupon(Long id, CouponRequest request) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Coupon not found with id: " + id));

        if (request.getCode() != null) coupon.setCode(request.getCode());
        if (request.getDiscountType() != null) coupon.setDiscountType(request.getDiscountType());
        if (request.getDiscountValue() != null) coupon.setDiscountValue(request.getDiscountValue());
        if (request.getUsageLimit() != null) coupon.setUsageLimit(request.getUsageLimit());
        if (request.getEndDate() != null) coupon.setEndDate(request.getEndDate());
        if (request.getIsActive() != null) coupon.setIsActive(request.getIsActive());

        return mapToResponse(couponRepository.save(coupon));
    }

    @Override
    @Transactional
    public void deleteCoupon(Long id) {
        if (!couponRepository.existsById(id)) {
            throw new RuntimeException("Coupon not found with id: " + id);
        }
        couponRepository.deleteById(id);
    }

    @Override
    @Transactional
    public CouponResponse useCoupon(Long id) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Coupon not found with id: " + id));

        // Kiểm tra còn active không
        if (!Boolean.TRUE.equals(coupon.getIsActive())) {
            throw new RuntimeException("Coupon đã bị vô hiệu hóa");
        }
        // Kiểm tra hết hạn
        if (coupon.getEndDate() != null && coupon.getEndDate().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Coupon đã hết hạn vào " + coupon.getEndDate());
        }
        // Kiểm tra hết lượt
        if (coupon.getUsedCount() >= coupon.getUsageLimit()) {
            throw new RuntimeException("Coupon đã dùng hết " + coupon.getUsageLimit() + " lượt");
        }

        coupon.setUsedCount(coupon.getUsedCount() + 1);
        return mapToResponse(couponRepository.save(coupon));
    }

    private Coupon mapFromRequest(CouponRequest request) {
        Coupon c = new Coupon();
        c.setCode(request.getCode());
        c.setDiscountType(request.getDiscountType());
        c.setDiscountValue(request.getDiscountValue());
        c.setUsageLimit(request.getUsageLimit() != null ? request.getUsageLimit() : 1);
        c.setUsedCount(0);
        c.setEndDate(request.getEndDate());
        c.setIsActive(request.getIsActive() != null ? request.getIsActive() : true);
        return c;
    }

    private CouponResponse mapToResponse(Coupon c) {
        LocalDateTime now = LocalDateTime.now();
        boolean isExpired = c.getEndDate() != null && c.getEndDate().isBefore(now);
        boolean isUsedUp  = c.getUsedCount() >= c.getUsageLimit();
        boolean isValid   = Boolean.TRUE.equals(c.getIsActive()) && !isExpired && !isUsedUp;

        CouponResponse r = new CouponResponse();
        r.setId(c.getId());
        r.setCode(c.getCode());
        r.setDiscountType(c.getDiscountType());
        r.setDiscountValue(c.getDiscountValue());
        r.setUsageLimit(c.getUsageLimit());
        r.setUsedCount(c.getUsedCount());
        r.setEndDate(c.getEndDate());
        r.setIsActive(c.getIsActive());
        r.setIsExpired(isExpired);
        r.setIsUsedUp(isUsedUp);
        r.setIsValid(isValid);
        return r;
    }
}
