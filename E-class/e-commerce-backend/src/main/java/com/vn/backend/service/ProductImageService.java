package com.vn.backend.service;

import java.util.List;

public interface ProductImageService {

    List<String> getImagesByProductId(Long productId);

    List<String> getImagesByVariantId(Long variantId);

    String getPrimaryImageByProductId(Long productId);
}
