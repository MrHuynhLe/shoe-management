package com.vn.backend.mapper;

import com.vn.backend.dto.response.ProductDetailResponse;
import com.vn.backend.dto.response.ProductVariantResponse;
import com.vn.backend.entity.Product;
import com.vn.backend.entity.ProductImage;
import com.vn.backend.entity.ProductVariant;
import org.springframework.stereotype.Component;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Component
public class ProductMapper {

    public ProductVariantResponse toVariantResponse(ProductVariant v) {

        Map<String, String> attributes = v.getVariantAttributeValues()
                .stream()
                .collect(Collectors.toMap(
                        av -> av.getAttributeValue().getAttribute().getCode(), // SIZE, COLOR
                        av -> av.getAttributeValue().getValue(),               // 42, Đen
                        (oldVal, newVal) -> oldVal
                ));

        return new ProductVariantResponse(
                v.getId(),
                v.getCode(),
                v.getCostPrice(),
                v.getSellingPrice(),
                v.getStockQuantity(),
                v.getIsActive(),
                attributes
        );
    }


    public ProductDetailResponse toDetailResponse(Product p) {

        List<ProductVariantResponse> variants = p.getVariants()
                .stream()
                .filter(v -> Boolean.TRUE.equals(v.getIsActive()))
                .map(this::toVariantResponse)
                .toList();

        List<String> images = p.getImages()
                .stream()
                .sorted(Comparator.comparing(ProductImage::getDisplayOrder))
                .map(ProductImage::getImageUrl)
                .toList();

        return new ProductDetailResponse(
                p.getId(),
                p.getCode(),
                p.getName(),
                p.getDescription(),
                p.getBrand().getName(),
                p.getCategory().getName(),
                p.getOrigin().getName(),
                p.getIsActive(),
                p.getDeletedAt(),
                variants,
                images
        );
    }
}
