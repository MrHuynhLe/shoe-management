package com.vn.backend.service;

import com.vn.backend.dto.request.ProductCreateRequest;
import com.vn.backend.dto.response.PageResponse;
import com.vn.backend.dto.response.ProductDetailResponse;
import com.vn.backend.dto.response.ProductListResponse;
import com.vn.backend.entity.Product;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;


public interface ProductService {

    PageResponse<ProductListResponse> getProductList(int page, int size);
    ProductDetailResponse getProductDetail(Long id);
    Product createWithImages(
            ProductCreateRequest request,
            MultipartFile primaryImage,
            List<MultipartFile> galleryImages
    );
    String uploadSingleImage(MultipartFile file);
}
