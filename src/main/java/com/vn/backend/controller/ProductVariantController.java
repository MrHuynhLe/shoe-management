package com.vn.backend.controller;

import com.vn.backend.dto.request.ProductVariantRequest;
import com.vn.backend.dto.response.ProductVariantResponse;
import com.vn.backend.service.ProductVariantService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/v1/variants")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class ProductVariantController {

    private final ProductVariantService variantService;

    // GET /v1/variants — tất cả variant chưa xóa
    @GetMapping
    public ResponseEntity<List<ProductVariantResponse>> getAll() {
        return ResponseEntity.ok(variantService.getAllVariants());
    }

    // GET /v1/variants/product/{productId} — variant theo sản phẩm
    @GetMapping("/product/{productId}")
    public ResponseEntity<List<ProductVariantResponse>> getByProduct(@PathVariable Long productId) {
        return ResponseEntity.ok(variantService.getVariantsByProduct(productId));
    }

    // GET /v1/variants/{id}
    @GetMapping("/{id}")
    public ResponseEntity<ProductVariantResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(variantService.getVariantById(id));
    }

    // GET /v1/variants/code/{code}
    @GetMapping("/code/{code}")
    public ResponseEntity<ProductVariantResponse> getByCode(@PathVariable String code) {
        return ResponseEntity.ok(variantService.getVariantByCode(code));
    }

    // GET /v1/variants/barcode/{barcode}
    @GetMapping("/barcode/{barcode}")
    public ResponseEntity<ProductVariantResponse> getByBarcode(@PathVariable String barcode) {
        return ResponseEntity.ok(variantService.getVariantByBarcode(barcode));
    }

    // POST /v1/variants — tạo variant, tự động sinh barcode
    @PostMapping
    public ResponseEntity<ProductVariantResponse> create(@RequestBody ProductVariantRequest request) {
        return ResponseEntity.ok(variantService.createVariant(request));
    }

    // PUT /v1/variants/{id}
    @PutMapping("/{id}")
    public ResponseEntity<ProductVariantResponse> update(@PathVariable Long id,
                                                          @RequestBody ProductVariantRequest request) {
        return ResponseEntity.ok(variantService.updateVariant(id, request));
    }

    // DELETE /v1/variants/{id} — soft delete
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        variantService.deleteVariant(id);
        return ResponseEntity.noContent().build();
    }
}
