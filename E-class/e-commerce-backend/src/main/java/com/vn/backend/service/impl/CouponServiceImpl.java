package com.vn.backend.service.impl;

import com.vn.backend.dto.request.CouponRequest;
import com.vn.backend.dto.response.CouponResponse;
import com.vn.backend.entity.Customer;
import com.vn.backend.entity.Coupon;
import com.vn.backend.entity.User;
import com.vn.backend.exception.ResourceNotFoundException;
import com.vn.backend.repository.CustomerRepository;
import com.vn.backend.repository.CouponRepository;
import com.vn.backend.repository.UserRepository;
import com.vn.backend.service.CouponService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CouponServiceImpl implements CouponService {

    private final CouponRepository couponRepository;
    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;

    @Override
    public Page<CouponResponse> getAll(Pageable pageable) {
        return couponRepository.findAll(pageable).map(this::mapToResponse);
    }

    @Override
    public CouponResponse getById(Long id) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon not found with id: " + id));
        return mapToResponse(coupon);
    }

    @Override
    @Transactional
    public CouponResponse create(CouponRequest request) {
        Coupon coupon = Coupon.builder()
                .code(request.getCode())
                .discountType(request.getDiscountType())
                .discountValue(request.getDiscountValue())
                .usageLimit(request.getUsageLimit() != null ? request.getUsageLimit() : 1)
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .build();
        Coupon saved = couponRepository.save(coupon);
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public CouponResponse update(Long id, CouponRequest request) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon not found with id: " + id));

        coupon.setCode(request.getCode());
        coupon.setDiscountType(request.getDiscountType());
        coupon.setDiscountValue(request.getDiscountValue());
        if (request.getUsageLimit() != null) coupon.setUsageLimit(request.getUsageLimit());
        if (request.getIsActive() != null) coupon.setIsActive(request.getIsActive());

        Coupon updated = couponRepository.save(coupon);
        return mapToResponse(updated);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon not found with id: " + id));
        coupon.setIsActive(false);
        couponRepository.save(coupon);
    }

    @Override
    public List<CouponResponse> getMyCoupons(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng"));

        Customer customer = customerRepository.findByUserProfileId(user.getUserProfile().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy khách hàng"));

        return couponRepository.findUnusedCouponsForCustomer(customer.getId()).stream()
                .map(this::mapToResponse)
                .toList();
    }

    private CouponResponse mapToResponse(Coupon coupon) {
        CouponResponse response = new CouponResponse();
        response.setId(coupon.getId());
        response.setCode(coupon.getCode());
        response.setDiscountType(coupon.getDiscountType());
        response.setDiscountValue(coupon.getDiscountValue());
        response.setUsageLimit(coupon.getUsageLimit());
        response.setIsActive(coupon.getIsActive());
        response.setCreatedAt(coupon.getCreatedAt());
        return response;
    }
}