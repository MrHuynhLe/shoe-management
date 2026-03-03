package com.vn.backend.controller;

import com.vn.backend.dto.request.CouponRequest;
import com.vn.backend.dto.response.CouponResponse;
import com.vn.backend.service.CouponService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/v1/coupons")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CouponController {

    private final CouponService couponService;

    // GET /coupons?page=0&size=10&sortBy=id&sortDir=desc .
    @GetMapping
    public ResponseEntity<Page<CouponResponse>> getAllCoupons(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return ResponseEntity.ok(couponService.getAllCoupons(pageable));
    }

    // GET /coupons/active
    @GetMapping("/active")
    public ResponseEntity<List<CouponResponse>> getAllActiveCoupons() {
        return ResponseEntity.ok(couponService.getAllActiveCoupons());
    }

    // GET /coupons/valid — còn hiệu lực (active + chưa hết hạn + chưa dùng hết lượt)
    @GetMapping("/valid")
    public ResponseEntity<List<CouponResponse>> getValidCoupons() {
        return ResponseEntity.ok(couponService.getValidCoupons());
    }

    // GET /coupons/{id}
    @GetMapping("/{id}")
    public ResponseEntity<CouponResponse> getCouponById(@PathVariable Long id) {
        return ResponseEntity.ok(couponService.getCouponById(id));
    }

    // GET /coupons/code/{code}
    @GetMapping("/code/{code}")
    public ResponseEntity<CouponResponse> getCouponByCode(@PathVariable String code) {
        return ResponseEntity.ok(couponService.getCouponByCode(code));
    }

    // GET /coupons/search?keyword=abc
    @GetMapping("/search")
    public ResponseEntity<List<CouponResponse>> searchCoupons(
            @RequestParam String keyword) {
        return ResponseEntity.ok(couponService.searchCoupons(keyword));
    }

    // POST /coupons
    @PostMapping
    public ResponseEntity<CouponResponse> createCoupon(@RequestBody CouponRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(couponService.createCoupon(request));
    }

    // PUT /coupons/{id}
    @PutMapping("/{id}")
    public ResponseEntity<CouponResponse> updateCoupon(
            @PathVariable Long id,
            @RequestBody CouponRequest request) {
        return ResponseEntity.ok(couponService.updateCoupon(id, request));
    }

    // DELETE /coupons/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCoupon(@PathVariable Long id) {
        couponService.deleteCoupon(id);
        return ResponseEntity.noContent().build();
    }

    // POST /coupons/{id}/use — simulate dùng coupon (tăng usedCount, validate)
    @PostMapping("/{id}/use")
    public ResponseEntity<CouponResponse> useCoupon(@PathVariable Long id) {
        return ResponseEntity.ok(couponService.useCoupon(id));
    }
}
