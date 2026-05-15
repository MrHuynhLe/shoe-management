package com.vn.backend.controller;

import com.vn.backend.dto.response.ProductReviewResponse;
import com.vn.backend.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/v1/products/{productId}/reviews")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class ProductReviewController {

    private final ReviewService reviewService;

    @GetMapping
    public ResponseEntity<ProductReviewResponse> getProductReviews(@PathVariable Long productId) {
        return ResponseEntity.ok(reviewService.getReviewsByProduct(productId));
    }
}
