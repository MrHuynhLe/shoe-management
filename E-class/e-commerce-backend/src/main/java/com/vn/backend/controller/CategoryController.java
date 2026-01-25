package com.vn.backend.controller;

import com.vn.backend.dto.request.CategoryRequest;
import com.vn.backend.dto.response.CategoryResponse;
import com.vn.backend.entity.Category;
import com.vn.backend.repository.CategoryRepository;
import com.vn.backend.service.CategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/v1/categories")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryRepository categoryRepository;
   private final CategoryService categoryService;

    @GetMapping
    public List<Category> getAll() {
        return categoryRepository.findByDeletedAtIsNullAndIsActiveTrue();
    }

//    @PostMapping
//    public Category create(@RequestBody @Valid Category category) {
//        category.setId(null);
//        category.setIsActive(true);
//        return categoryRepository.save(category);
//    }
//    @GetMapping
//    public ResponseEntity<Page<CategoryResponse>> getAllCategories(
//            @RequestParam(defaultValue = "0") int page,
//            @RequestParam(defaultValue = "10") int size,
//            @RequestParam(defaultValue = "id") String sortBy,
//            @RequestParam(defaultValue = "asc") String sortDir) {
//
//        Sort sort = sortDir.equalsIgnoreCase("desc")
//                ? Sort.by(sortBy).descending()
//                : Sort.by(sortBy).ascending();
//        Pageable pageable = PageRequest.of(page, size, sort);
//
//        Page<CategoryResponse> categories = categoryService.getAllCategories(pageable);
//        return ResponseEntity.ok(categories);
//    }

    @GetMapping("/active")
    public ResponseEntity<List<CategoryResponse>> getAllActiveCategories() {
        List<CategoryResponse> categories = categoryService.getAllActiveCategories();
        return ResponseEntity.ok(categories);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CategoryResponse> getCategoryById(@PathVariable Long id) {
        CategoryResponse category = categoryService.getCategoryById(id);
        return ResponseEntity.ok(category);
    }

    @GetMapping("/search")
    public ResponseEntity<Page<CategoryResponse>> searchCategories(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<CategoryResponse> categories = categoryService.searchCategories(keyword, pageable);
        return ResponseEntity.ok(categories);
    }

    @PostMapping
    public ResponseEntity<CategoryResponse> createCategory(@RequestBody CategoryRequest request) {
        CategoryResponse category = categoryService.createCategory(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(category);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CategoryResponse> updateCategory(
            @PathVariable Long id,
            @RequestBody CategoryRequest request) {
        CategoryResponse category = categoryService.updateCategory(id, request);
        return ResponseEntity.ok(category);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.noContent().build();
    }

}
