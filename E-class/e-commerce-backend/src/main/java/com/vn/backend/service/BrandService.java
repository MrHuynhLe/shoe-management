package com.vn.backend.service;

import com.vn.backend.dto.request.BrandRequest;
import com.vn.backend.dto.response.BrandResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

public interface BrandService {
    Page<BrandResponse> getAllBrands(Pageable pageable);
    List<BrandResponse> getAllActiveBrands();
    BrandResponse getBrandById(Long id);
    BrandResponse createBrand(BrandRequest request);
    BrandResponse updateBrand(Long id, BrandRequest request);
    void deleteBrand(Long id);
    Page<BrandResponse> searchBrands(String keyword, Pageable pageable);
}