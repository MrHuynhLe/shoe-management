package com.vn.backend.service.impl;

import com.vn.backend.dto.response.ProductPriceResponse;
import com.vn.backend.entity.ProductPromotionCampaign;
import com.vn.backend.entity.ProductVariant;
import com.vn.backend.entity.PromotionVariant;
import com.vn.backend.repository.ProductVariantRepository;
import com.vn.backend.repository.PromotionVariantRepository;
import com.vn.backend.service.ProductPriceService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.OffsetDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProductPriceServiceImpl implements ProductPriceService {

    private static final BigDecimal ONE_HUNDRED = BigDecimal.valueOf(100);

    private final ProductVariantRepository productVariantRepository;
    private final PromotionVariantRepository promotionVariantRepository;

    @Override
    public ProductPriceResponse calculateCurrentPrice(Long productId, Long variantId) {
        ProductVariant variant = productVariantRepository.findById(variantId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy biến thể sản phẩm"));

        if (productId != null
                && variant.getProduct() != null
                && !productId.equals(variant.getProduct().getId())) {
            throw new IllegalArgumentException("Biến thể không thuộc sản phẩm đã chọn");
        }

        return calculateCurrentPrice(variant);
    }

    @Override
    public ProductPriceResponse calculateCurrentPrice(ProductVariant variant) {
        BigDecimal originalPrice = variant == null || variant.getSellingPrice() == null
                ? BigDecimal.ZERO
                : variant.getSellingPrice();

        ProductPromotionCampaign promotion = findActivePromotion(variant);
        if (promotion == null) {
            return ProductPriceResponse.builder()
                    .originalPrice(originalPrice)
                    .unitPrice(originalPrice)
                    .salePrice(originalPrice)
                    .discountPercent(BigDecimal.ZERO)
                    .promotionId(null)
                    .promotionName(null)
                    .isSale(false)
                    .build();
        }

        BigDecimal discountPercent = promotion.getDiscountPercent();
        BigDecimal salePrice = originalPrice
                .multiply(ONE_HUNDRED.subtract(discountPercent))
                .divide(ONE_HUNDRED, 2, RoundingMode.HALF_UP);

        return ProductPriceResponse.builder()
                .originalPrice(originalPrice)
                .unitPrice(salePrice)
                .salePrice(salePrice)
                .discountPercent(discountPercent)
                .promotionId(promotion.getId())
                .promotionName(promotion.getName())
                .isSale(true)
                .build();
    }

    private ProductPromotionCampaign findActivePromotion(ProductVariant variant) {
        if (variant == null || variant.getId() == null) {
            return null;
        }

        List<PromotionVariant> activeRows = promotionVariantRepository.findActiveByVariantIds(
                List.of(variant.getId()),
                OffsetDateTime.now()
        );

        if (CollectionUtils.isEmpty(activeRows)) {
            return null;
        }

        return activeRows.get(0).getPromotion();
    }
}
