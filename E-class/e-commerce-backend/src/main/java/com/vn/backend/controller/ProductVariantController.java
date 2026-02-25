package com.vn.backend.controller;

import com.vn.backend.dto.request.ProductVariantRequest;
import com.vn.backend.service.ProductVariantService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
@RestController
@RequestMapping("/api/product-variants")
@RequiredArgsConstructor
public class ProductVariantController {

    private final ProductVariantService productVariantService;

    @PostMapping
    public ResponseEntity<?> createVariants(
            @RequestBody ProductVariantRequest request
    ) {
        productVariantService.createVariants(request);
        return ResponseEntity.ok("Create product variants success");
    }
}


