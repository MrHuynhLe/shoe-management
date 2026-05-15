package com.vn.backend.controller;

import com.vn.backend.dto.request.ReviewRequest;
import com.vn.backend.dto.response.ReviewItemResponse;
import com.vn.backend.security.CustomUserDetails;
import com.vn.backend.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/v1/order-items/{orderItemId}/reviews")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class OrderItemReviewController {

    private final ReviewService reviewService;

    @PostMapping
    public ResponseEntity<ReviewItemResponse> createReviewByOrderItem(
            @PathVariable Long orderItemId,
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody ReviewRequest request
    ) {
        return ResponseEntity.ok(reviewService.createReviewFromCompletedOrder(orderItemId, userDetails, request));
    }
}
