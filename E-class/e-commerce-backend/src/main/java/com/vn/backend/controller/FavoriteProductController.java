package com.vn.backend.controller;

import com.vn.backend.entity.FavoriteProduct;
import com.vn.backend.security.CustomUserDetails;
import com.vn.backend.service.impl.FavoriteProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/v1/favorites")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class FavoriteProductController {

    private final FavoriteProductService favoriteProductService;

    @PostMapping("/{productId}")
    public String addFavorite(@AuthenticationPrincipal CustomUserDetails userDetails
            , @PathVariable Long productId) {
        favoriteProductService.addFavorite(userDetails, productId);
        return "Đã thêm vào yêu thích";
    }

    @DeleteMapping("/{productId}")
    public String removeFavorite(@AuthenticationPrincipal CustomUserDetails userDetails
            , @PathVariable Long productId) {
        favoriteProductService.removeFavorite(userDetails, productId);
        return "Đã xóa khỏi yêu thích";
    }

    @GetMapping("/{productId}/check")
    public boolean isFavorite(@AuthenticationPrincipal CustomUserDetails userDetails
            ,
                              @PathVariable Long productId) {
        return favoriteProductService.isFavorite(userDetails, productId);
    }

    @GetMapping
    public List<FavoriteProduct> getMyFavorites(@AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        return favoriteProductService.getMyFavorites(userDetails);
    }
}