package com.vn.backend.controller;

import com.vn.backend.dto.request.ProductImageCreateRequest;
import com.vn.backend.service.ProductImageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/v1/product-images")
@RequiredArgsConstructor
@CrossOrigin
public class ProductImageController {

    private final ProductImageService productImageService;

    @PostMapping
    public ResponseEntity<?> create(@RequestBody ProductImageCreateRequest request) {
        productImageService.create(request);
        return ResponseEntity.ok().build();
    }
}