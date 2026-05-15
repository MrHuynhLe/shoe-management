package com.vn.backend.controller;

import com.vn.backend.dto.request.ProductCreateRequest;
import com.vn.backend.dto.request.ProductUpdateRequest;
import com.vn.backend.dto.response.PageResponse;
import com.vn.backend.dto.response.ProductDetailResponse;
import com.vn.backend.dto.response.ProductListResponse;
import com.vn.backend.entity.Product;
import com.vn.backend.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.math.BigDecimal;

@RestController
@RequestMapping("/v1/products")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @GetMapping
    public ResponseEntity<PageResponse<ProductListResponse>> getProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Long brandId,
            @RequestParam(defaultValue = "false") boolean includeInactive
    ) {
        return ResponseEntity.ok(
                productService.getProductList(page, size, categoryId, brandId, includeInactive)
        );
    }

    @GetMapping("/filter")
    public ResponseEntity<PageResponse<ProductListResponse>> filterProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Long brandId,
            @RequestParam(required = false) String sizeValue,
            @RequestParam(required = false) String color,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) String sort,
            @RequestParam(required = false) Boolean isSale,
            @RequestParam(defaultValue = "false") boolean excludeSale
    ) {
        return ResponseEntity.ok(productService.filterProducts(
                page,
                size,
                keyword,
                categoryId,
                brandId,
                sizeValue,
                color,
                minPrice,
                maxPrice,
                sort,
                excludeSale ? Boolean.FALSE : isSale
        ));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductDetailResponse> getProductDetail(
            @PathVariable Long id,
            @RequestParam(defaultValue = "false") boolean includeInactive
    ) {
        return ResponseEntity.ok(productService.getProductDetail(id, includeInactive));
    }

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Product> create(@RequestBody @Valid ProductCreateRequest request) {
        Product product = productService.create(request);
        return ResponseEntity.ok(product);
    }

    @PutMapping(value = "/{id}", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ProductDetailResponse> update(
            @PathVariable Long id,
            @RequestBody @Valid ProductUpdateRequest request
    ) {
        return ResponseEntity.ok(productService.update(id, request));
    }

    @PostMapping(value = "/with-images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Product> createWithImages(
            @RequestPart("data") @Valid ProductCreateRequest request,
            @RequestPart(value = "image", required = false) MultipartFile image,
            @RequestPart(value = "images", required = false) List<MultipartFile> images
    ) {
        Product product = productService.createWithImages(request, image, images);
        return ResponseEntity.ok(product);
    }

    @PostMapping(value = "/upload-image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<String> uploadImage(@RequestPart("file") MultipartFile file) {
        String fileUrl = productService.uploadSingleImage(file);
        return ResponseEntity.ok(fileUrl);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }
}
