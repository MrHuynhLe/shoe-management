package com.vn.backend.controller;

import com.vn.backend.dto.request.ShippingProviderRequest;
import com.vn.backend.dto.response.ShippingProviderResponse;
import com.vn.backend.service.ShippingProviderService;
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
@RequestMapping("/v1/shipping-providers")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ShippingProviderController {

    private final ShippingProviderService shippingProviderService;

    @GetMapping
    public ResponseEntity<Page<ShippingProviderResponse>> getAllShippingProviders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<ShippingProviderResponse> providers = shippingProviderService.getAllShippingProviders(pageable);
        return ResponseEntity.ok(providers);
    }

    @GetMapping("/active")
    public ResponseEntity<List<ShippingProviderResponse>> getAllActiveShippingProviders() {
        List<ShippingProviderResponse> providers = shippingProviderService.getAllActiveShippingProviders();
        return ResponseEntity.ok(providers);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ShippingProviderResponse> getShippingProviderById(@PathVariable Long id) {
        ShippingProviderResponse provider = shippingProviderService.getShippingProviderById(id);
        return ResponseEntity.ok(provider);
    }

    @PostMapping
    public ResponseEntity<ShippingProviderResponse> createShippingProvider(@RequestBody ShippingProviderRequest request) {
        ShippingProviderResponse provider = shippingProviderService.createShippingProvider(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(provider);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ShippingProviderResponse> updateShippingProvider(
            @PathVariable Long id,
            @RequestBody ShippingProviderRequest request) {
        ShippingProviderResponse provider = shippingProviderService.updateShippingProvider(id, request);
        return ResponseEntity.ok(provider);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteShippingProvider(@PathVariable Long id) {
        shippingProviderService.deleteShippingProvider(id);
        return ResponseEntity.noContent().build();
    }
}