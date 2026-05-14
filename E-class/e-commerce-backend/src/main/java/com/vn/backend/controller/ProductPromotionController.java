package com.vn.backend.controller;

import com.vn.backend.dto.request.ProductPromotionRequest;
import com.vn.backend.dto.response.ProductPromotionResponse;
import com.vn.backend.dto.response.PromotionAppliedIdsResponse;
import com.vn.backend.service.ProductPromotionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/promotions")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class ProductPromotionController {

    private final ProductPromotionService productPromotionService;

    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<ProductPromotionResponse>> getAll(Pageable pageable) {
        return ResponseEntity.ok(productPromotionService.getAll(pageable));
    }

    @PostMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProductPromotionResponse> create(@Valid @RequestBody ProductPromotionRequest request) {
        return new ResponseEntity<>(productPromotionService.create(request), HttpStatus.CREATED);
    }

    @PutMapping("/admin/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProductPromotionResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody ProductPromotionRequest request
    ) {
        return ResponseEntity.ok(productPromotionService.update(id, request));
    }

    @DeleteMapping("/admin/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        productPromotionService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/admin/{id}/toggle")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProductPromotionResponse> toggle(@PathVariable Long id) {
        return ResponseEntity.ok(productPromotionService.toggle(id));
    }

    @GetMapping("/{id}/products/ids")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PromotionAppliedIdsResponse> getAppliedIds(@PathVariable Long id) {
        return ResponseEntity.ok(productPromotionService.getAppliedIds(id));
    }
}
