package com.vn.backend.controller;

import com.vn.backend.dto.request.ValidateDiscountRequest;
import com.vn.backend.dto.response.AvailableVoucherResponse;
import com.vn.backend.dto.response.ValidateDiscountResponse;
import com.vn.backend.security.CustomUserDetails;
import com.vn.backend.service.DiscountService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/v1/discounts")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class DiscountController {

    private final DiscountService discountService;

    @PostMapping("/validate")
    public ResponseEntity<ValidateDiscountResponse> validate(
            @Valid @RequestBody ValidateDiscountRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        return ResponseEntity.ok(discountService.validateDiscount(request, userDetails));
    }


}