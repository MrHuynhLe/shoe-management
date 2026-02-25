package com.vn.backend.controller;

import com.vn.backend.dto.response.PageResponse;
import com.vn.backend.dto.response.ProductListResponse;
import com.vn.backend.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/v1/products")
@CrossOrigin(origins = "http://localhost:5173")
public class ProductController {
    @Autowired
    private  ProductService productService;

    @GetMapping
    public ResponseEntity<PageResponse<ProductListResponse>> getProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size
    ) {
        return ResponseEntity.ok(
                productService.getProductList(page, size)
        );
    }

}
