package com.vn.backend.service;

import com.vn.backend.dto.request.ProductCreateRequest;
import com.vn.backend.dto.response.PageResponse;
import com.vn.backend.dto.response.ProductDetailResponse;
import com.vn.backend.dto.response.ProductListResponse;
import com.vn.backend.entity.Product;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface ProductService {

    PageResponse<ProductListResponse> getProductList(int page, int size, Long categoryId);

    ProductDetailResponse getProductDetail(Long id);

    Product create(ProductCreateRequest request);

    Product createWithImages(
            ProductCreateRequest request,
            MultipartFile primaryImage,
            List<MultipartFile> galleryImages
    );

    String uploadSingleImage(MultipartFile file);
}