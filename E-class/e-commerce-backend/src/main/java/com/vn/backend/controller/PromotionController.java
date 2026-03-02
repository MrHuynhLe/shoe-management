package com.vn.backend.controller;

import com.vn.backend.dto.request.PromotionRequest;
import com.vn.backend.dto.response.PromotionResponse;
import com.vn.backend.service.PromotionService;
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
@RequestMapping("/v1/promotions")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PromotionController {

    private final PromotionService promotionService;

    @GetMapping
    public ResponseEntity<Page<PromotionResponse>> getAllPromotions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<PromotionResponse> promotions = promotionService.getAllPromotions(pageable);
        return ResponseEntity.ok(promotions);
    }

    @GetMapping("/active")
    public ResponseEntity<List<PromotionResponse>> getAllActivePromotions() {
        List<PromotionResponse> promotions = promotionService.getAllActivePromotions();
        return ResponseEntity.ok(promotions);
    }

    @GetMapping("/current")
    public ResponseEntity<List<PromotionResponse>> getCurrentActivePromotions() {
        List<PromotionResponse> promotions = promotionService.getCurrentActivePromotions();
        return ResponseEntity.ok(promotions);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PromotionResponse> getPromotionById(@PathVariable Long id) {
        PromotionResponse promotion = promotionService.getPromotionById(id);
        return ResponseEntity.ok(promotion);
    }

    @GetMapping("/code/{code}")
    public ResponseEntity<PromotionResponse> getPromotionByCode(@PathVariable String code) {
        PromotionResponse promotion = promotionService.getPromotionByCode(code);
        return ResponseEntity.ok(promotion);
    }

    @PostMapping
    public ResponseEntity<PromotionResponse> createPromotion(@RequestBody PromotionRequest request) {
        PromotionResponse promotion = promotionService.createPromotion(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(promotion);
    }

    @PutMapping("/{id}")
    public ResponseEntity<PromotionResponse> updatePromotion(
            @PathVariable Long id,
            @RequestBody PromotionRequest request) {
        PromotionResponse promotion = promotionService.updatePromotion(id, request);
        return ResponseEntity.ok(promotion);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePromotion(@PathVariable Long id) {
        promotionService.deletePromotion(id);
        return ResponseEntity.noContent().build();
    }
}