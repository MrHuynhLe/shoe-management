package com.vn.backend.service;

import com.vn.backend.dto.request.CategoryRequest;
import com.vn.backend.dto.response.CategoryResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface CategoryService {
    Page<CategoryResponse> getAllCategories(Pageable pageable);
    List<CategoryResponse> getAllActiveCategories();
    CategoryResponse getCategoryById(Long id);
    CategoryResponse createCategory(CategoryRequest request);
    CategoryResponse updateCategory(Long id, CategoryRequest request);
    void deleteCategory(Long id);
    Page<CategoryResponse> searchCategories(String keyword, Pageable pageable);
}