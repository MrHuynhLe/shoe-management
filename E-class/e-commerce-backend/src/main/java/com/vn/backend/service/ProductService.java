package com.vn.backend.service;

import com.vn.backend.dto.response.PageResponse;
import com.vn.backend.dto.response.ProductListResponse;

public interface ProductService {

    PageResponse<ProductListResponse> getProductList(int page, int size);
}
