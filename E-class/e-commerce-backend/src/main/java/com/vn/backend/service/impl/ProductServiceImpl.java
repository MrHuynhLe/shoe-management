package com.vn.backend.service.impl;

import com.vn.backend.dto.response.PageResponse;
import com.vn.backend.dto.response.ProductListResponse;
import com.vn.backend.mapper.PageMapper;
import com.vn.backend.repository.ProductRepository;
import com.vn.backend.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;

    @Override
    public PageResponse<ProductListResponse> getProductList(int page, int size) {

        Pageable pageable = PageRequest.of(page, size);

        Page<ProductListResponse> pageData =
                productRepository.findProductList(pageable);

        return PageMapper.toPageResponse(pageData, dto -> dto);
    }
}
