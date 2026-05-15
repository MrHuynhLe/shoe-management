package com.vn.backend.service;

import com.vn.backend.dto.response.ProductPriceResponse;
import com.vn.backend.entity.ProductVariant;

public interface ProductPriceService {
    ProductPriceResponse calculateCurrentPrice(Long productId, Long variantId);

    ProductPriceResponse calculateCurrentPrice(ProductVariant variant);
}
