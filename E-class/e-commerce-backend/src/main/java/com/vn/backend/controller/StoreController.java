package com.vn.backend.controller;

import com.vn.backend.entity.Store;
import com.vn.backend.repository.StoreRepository;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/v1/stores")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class StoreController {

    private final StoreRepository storeRepository;

    @GetMapping("/active")
    public List<StoreResponse> getActiveStores() {
        return storeRepository.findAllActive()
                .stream()
                .map(store -> new StoreResponse(
                        store.getId(),
                        store.getName(),
                        store.getAddress()
                ))
                .toList();
    }

    @Data
    @AllArgsConstructor
    public static class StoreResponse {
        private Long id;
        private String name;
        private String address;
    }
}