package com.vn.backend.service;

import com.vn.backend.dto.response.PageResponse;
import com.vn.backend.dto.response.ProductDetailResponse;
import com.vn.backend.dto.response.ProductListResponse;
import org.springframework.transaction.annotation.Transactional;

@Transactional(readOnly = true)
public interface ProductService {

    PageResponse<ProductListResponse> getProductList(int page, int size);
    ProductDetailResponse getProductDetail(Long id);
}
