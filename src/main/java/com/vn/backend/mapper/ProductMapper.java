package com.vn.backend.mapper;

import com.vn.backend.dto.response.AttributeItemResponse;
import com.vn.backend.dto.response.ProductDetailResponse;
import com.vn.backend.dto.response.ProductVariantResponse;
import com.vn.backend.entity.Product;
import com.vn.backend.entity.ProductImage;
import com.vn.backend.entity.ProductVariant;
import org.springframework.stereotype.Component;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class ProductMapper {

    public ProductVariantResponse toVariantResponse(ProductVariant v) {

        List<AttributeItemResponse> attributes = v.getAttributeValues()
                .stream()
                .map(av -> new AttributeItemResponse(
                        av.getId(),
                        av.getAttribute().getCode(),
                        av.getValue()
                ))
                .collect(Collectors.toList());

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
                p.getOrigin() != null ? p.getOrigin().getName() : null,
                p.getIsActive(),
                p.getDeletedAt(),
                variants,
                images
        );
    }
}
