package com.vn.backend.service;

import com.vn.backend.dto.request.ProductRequest;
import com.vn.backend.dto.response.PageResponse;
import com.vn.backend.dto.response.ProductListResponse;
import com.vn.backend.dto.response.ProductResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ProductService {

    Page<ProductResponse> getAllProducts(Pageable pageable);

    List<ProductResponse> getAllActiveProducts();

    ProductResponse getProductById(Long id);

    Page<ProductResponse> searchProducts(String keyword, Pageable pageable);

    ProductResponse createProduct(ProductRequest request);

    ProductResponse updateProduct(Long id, ProductRequest request);

    void deleteProduct(Long id);

    // Legacy list query (aggregated with price/stock from variants)
    PageResponse<ProductListResponse> getProductList(int page, int size);
}
