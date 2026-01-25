package com.vn.backend.controller;


import com.vn.backend.dto.request.ProductVariantCreateRequest;
import com.vn.backend.dto.response.ProductVariantResponse;
import com.vn.backend.service.ProductVariantService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/v1/product-variants")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class ProductVariantController {

    private final ProductVariantService productVariantService;

    // ✅ GET ALL
    @GetMapping
    public ResponseEntity<List<ProductVariantResponse>> getAll() {
        return ResponseEntity.ok(
                productVariantService.getAllVariants()
        );
    }

    // ✅ GET BY PRODUCT
    @GetMapping("/product/{productId}")
    public ResponseEntity<List<ProductVariantResponse>> getByProduct(
            @PathVariable Long productId
    ) {
        return ResponseEntity.ok(
                productVariantService.getVariantsByProduct(productId)
        );
    }

    // ✅ GET DETAIL
    @GetMapping("/{id}")
    public ResponseEntity<ProductVariantResponse> getDetail(
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(
                productVariantService.getVariantDetail(id)
        );
    }
    // ================= CREATE =================
    // CREATE SKU
    @PostMapping
    public ResponseEntity<?> create(@RequestBody ProductVariantCreateRequest request) {
        return ResponseEntity.ok(productVariantService.create(request));
    }


    // ✅ TEST
    @GetMapping("/test")
    public String test() {
        return "OK";
    }
}