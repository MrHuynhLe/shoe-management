package com.vn.backend.service.impl;

import com.vn.backend.dto.request.ProductRequest;
import com.vn.backend.dto.response.PageResponse;
import com.vn.backend.dto.response.ProductListResponse;
import com.vn.backend.dto.response.ProductResponse;
import com.vn.backend.entity.Brand;
import com.vn.backend.entity.Category;
import com.vn.backend.entity.Product;
import com.vn.backend.mapper.PageMapper;
import com.vn.backend.repository.BrandRepository;
import com.vn.backend.repository.CategoryRepository;
import com.vn.backend.repository.ProductRepository;
import com.vn.backend.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final BrandRepository brandRepository;
    private final CategoryRepository categoryRepository;

    @Override
    public Page<ProductResponse> getAllProducts(Pageable pageable) {
        return productRepository.findAllActive(pageable)
                .map(this::mapToResponse);
    }

    @Override
    public List<ProductResponse> getAllActiveProducts() {
        return productRepository.findAllActive().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public ProductResponse getProductById(Long id) {
        Product product = productRepository.findByIdActive(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));
        return mapToResponse(product);
    }

    @Override
    public Page<ProductResponse> searchProducts(String keyword, Pageable pageable) {
        return productRepository.searchByKeyword(keyword, pageable)
                .map(this::mapToResponse);
    }

    @Override
    @Transactional
    public ProductResponse createProduct(ProductRequest request) {
        Brand brand = brandRepository.findByIdActive(request.getBrandId())
                .orElseThrow(() -> new RuntimeException("Brand not found with id: " + request.getBrandId()));

        Category category = categoryRepository.findByIdActive(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found with id: " + request.getCategoryId()));

        Product product = new Product();
        product.setCode(request.getCode());
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setBrand(brand);
        product.setCategory(category);
        product.setIsActive(request.getIsActive() != null ? request.getIsActive() : true);

        Product saved = productRepository.save(product);
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public ProductResponse updateProduct(Long id, ProductRequest request) {
        Product product = productRepository.findByIdActive(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));

        if (request.getBrandId() != null) {
            Brand brand = brandRepository.findByIdActive(request.getBrandId())
                    .orElseThrow(() -> new RuntimeException("Brand not found with id: " + request.getBrandId()));
            product.setBrand(brand);
        }

        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findByIdActive(request.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Category not found with id: " + request.getCategoryId()));
            product.setCategory(category);
        }

        if (request.getCode() != null) product.setCode(request.getCode());
        if (request.getName() != null) product.setName(request.getName());
        if (request.getDescription() != null) product.setDescription(request.getDescription());
        if (request.getIsActive() != null) product.setIsActive(request.getIsActive());

        Product updated = productRepository.save(product);
        return mapToResponse(updated);
    }

    @Override
    @Transactional
    public void deleteProduct(Long id) {
        Product product = productRepository.findByIdActive(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));
        product.setDeletedAt(LocalDateTime.now());
        productRepository.save(product);
    }

    @Override
    public PageResponse<ProductListResponse> getProductList(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<ProductListResponse> pageData = productRepository.findProductList(pageable);
        return PageMapper.toPageResponse(pageData, dto -> dto);
    }

    private ProductResponse mapToResponse(Product product) {
        ProductResponse response = new ProductResponse();
        response.setId(product.getId());
        response.setCode(product.getCode());
        response.setName(product.getName());
        response.setDescription(product.getDescription());
        response.setIsActive(product.getIsActive());
        response.setCreatedAt(product.getCreatedAt());
        response.setDeletedAt(product.getDeletedAt());
        if (product.getBrand() != null) {
            response.setBrandId(product.getBrand().getId());
            response.setBrandName(product.getBrand().getName());
        }
        if (product.getCategory() != null) {
            response.setCategoryId(product.getCategory().getId());
            response.setCategoryName(product.getCategory().getName());
        }
        return response;
    }
}
