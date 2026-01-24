package com.vn.backend.controller;

import com.vn.backend.entity.Category;
import com.vn.backend.repository.CategoryRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/v1/categories")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryRepository categoryRepository;

    @GetMapping
    public List<Category> getAll() {
        return categoryRepository.findByDeletedAtIsNullAndIsActiveTrue();
    }

    @PostMapping
    public Category create(@RequestBody @Valid Category category) {
        category.setId(null);
        category.setIsActive(true);
        return categoryRepository.save(category);
    }


}
