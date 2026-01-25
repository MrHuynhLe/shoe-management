package com.vn.backend.controller;

import com.vn.backend.dto.request.BrandRequest;
import com.vn.backend.dto.response.BrandResponse;
import com.vn.backend.entity.Brand;
import com.vn.backend.repository.BrandRepository;
import com.vn.backend.service.BrandService;
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
@RequestMapping("/v1/brands")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class BrandController {

    private final BrandRepository brandRepository;
    private final BrandService brandService;
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
//    @GetMapping
//    public ResponseEntity<Page<BrandResponse>> getAllBrands(
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
//        Page<BrandResponse> brands = brandService.getAllBrands(pageable);
//        return ResponseEntity.ok(brands);
//    }

    @GetMapping("/active")
    public ResponseEntity<List<BrandResponse>> getAllActiveBrands() {
        List<BrandResponse> brands = brandService.getAllActiveBrands();
        return ResponseEntity.ok(brands);
    }

    @GetMapping("/{id}")
    public ResponseEntity<BrandResponse> getBrandById(@PathVariable Long id) {
        BrandResponse brand = brandService.getBrandById(id);
        return ResponseEntity.ok(brand);
    }

    @GetMapping("/search")
    public ResponseEntity<Page<BrandResponse>> searchBrands(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<BrandResponse> brands = brandService.searchBrands(keyword, pageable);
        return ResponseEntity.ok(brands);
    }



    @PutMapping("/{id}")
    public ResponseEntity<BrandResponse> updateBrand(
            @PathVariable Long id,
            @RequestBody BrandRequest request) {
        BrandResponse brand = brandService.updateBrand(id, request);
        return ResponseEntity.ok(brand);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBrand(@PathVariable Long id) {
        brandService.deleteBrand(id);
        return ResponseEntity.noContent().build();
    }

}
