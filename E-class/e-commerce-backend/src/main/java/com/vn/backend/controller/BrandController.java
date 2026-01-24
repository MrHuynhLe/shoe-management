package com.vn.backend.controller;

import com.vn.backend.entity.Brand;
import com.vn.backend.repository.BrandRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/v1/brands")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class BrandController {

    private final BrandRepository brandRepository;

    // GET all active
    @GetMapping
    public List<Brand> getAll() {
        return brandRepository.findByDeletedAtIsNullAndIsActiveTrue();
    }

    // POST create
    @PostMapping
    public Brand create(@RequestBody @Valid Brand brand) {
        brand.setId(null);
        brand.setIsActive(true);
        return brandRepository.save(brand);
    }


}
