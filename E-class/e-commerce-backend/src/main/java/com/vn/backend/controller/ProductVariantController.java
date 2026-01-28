package com.vn.backend.controller;

import com.vn.backend.dto.request.VariantBulkRequest;
import com.vn.backend.service.ProductVariantService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/v1/variants")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class ProductVariantController {

    private final ProductVariantService variantService;

    @PostMapping(value = "/bulk", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> createBulk(@RequestBody VariantBulkRequest request) {
        variantService.createBulkVariants(request);
        return ResponseEntity.ok("Thành công");

    }
  

}