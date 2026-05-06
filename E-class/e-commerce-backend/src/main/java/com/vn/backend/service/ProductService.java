package com.vn.backend.service;

import com.vn.backend.dto.request.ProductCreateRequest;
import com.vn.backend.dto.request.ProductUpdateRequest;
import com.vn.backend.dto.response.PageResponse;
import com.vn.backend.dto.response.ProductDetailResponse;
import com.vn.backend.dto.response.ProductListResponse;
import com.vn.backend.entity.Product;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface ProductService {

    PageResponse<ProductListResponse> getProductList(
            int page,
            int size,
            Long categoryId,
            boolean includeInactive
    );

    ProductDetailResponse getProductDetail(Long id, boolean includeInactive);

    Product create(ProductCreateRequest request);

    ProductDetailResponse update(Long productId, ProductUpdateRequest request);

    Product createWithImages(
            ProductCreateRequest request,
            MultipartFile primaryImage,
            List<MultipartFile> galleryImages
    );

    String uploadSingleImage(MultipartFile file);

    void deleteProduct(Long productId);
}