package com.vn.backend.service.impl;

import com.vn.backend.dto.request.ProductVariantRequest;
import com.vn.backend.dto.request.VariantBulkRequest;
import com.vn.backend.dto.response.AttributeItemResponse;
import com.vn.backend.dto.response.ProductVariantResponse;
import com.vn.backend.entity.*;
import com.vn.backend.exception.ResourceNotFoundException;
import com.vn.backend.repository.*;
import com.vn.backend.service.ProductVariantService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductVariantServiceImpl implements ProductVariantService {

    private final ProductVariantRepository variantRepository;
    private final ProductRepository productRepository;
    private final AttributeValueRepository attributeValueRepository;
    private final ProductImageRepository productImageRepository;

    private String generateUniqueCode(String productCode) {
        String base = (productCode != null && !productCode.isBlank()) ? productCode.trim() : "VAR";
        String candidate;
        do {
            candidate = "SKU-" + base + "-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        } while (variantRepository.existsByCode(candidate));
        return candidate;
    }

    private String normalizeOrGenerateCode(String code, String productCode) {
        if (code == null || code.isBlank()) {
            return generateUniqueCode(productCode);
        }
        return code.trim();
    }

    private String normalizeOrGenerateBarcode(String barcode) {
        if (barcode == null || barcode.isBlank()) {
            String candidate;
            do {
                candidate = String.valueOf(Math.abs(UUID.randomUUID().getMostSignificantBits()));
            } while (variantRepository.existsByBarcode(candidate));
            return candidate;
        }
        return barcode.trim();
    }

    private ProductVariantResponse mapToResponse(ProductVariant variant) {
        List<AttributeItemResponse> attributes = variant.getAttributeValues().stream()
                .map(av -> new AttributeItemResponse(
                        av.getId(),
                        av.getAttribute().getCode(),
                        av.getValue()
                ))
                .collect(Collectors.toList());

        return new ProductVariantResponse(
                variant.getId(),
                variant.getCode(),
                variant.getCostPrice(),
                variant.getSellingPrice(),
                variant.getStockQuantity(),
                variant.getIsActive(),
                attributes
        );
    }

    @Override
    public List<ProductVariantResponse> getAllVariants() {
        return variantRepository.findByDeletedAtIsNull().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<ProductVariantResponse> getVariantsByProduct(Long productId) {
        return variantRepository.findByProductIdAndDeletedAtIsNull(productId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public ProductVariantResponse getVariantById(Long id) {
        ProductVariant variant = variantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Variant không tồn tại"));
        if (variant.getDeletedAt() != null) {
            throw new ResourceNotFoundException("Variant đã bị xóa");
        }
        return mapToResponse(variant);
    }

    @Override
    public ProductVariantResponse getVariantByCode(String code) {
        ProductVariant variant = variantRepository.findByCodeAndDeletedAtIsNull(code)
                .orElseThrow(() -> new ResourceNotFoundException("Variant không tồn tại"));
        return mapToResponse(variant);
    }

    @Override
    public ProductVariantResponse getVariantByBarcode(String barcode) {
        ProductVariant variant = variantRepository.findByBarcodeAndDeletedAtIsNull(barcode)
                .orElseThrow(() -> new ResourceNotFoundException("Variant không tồn tại"));
        return mapToResponse(variant);
    }

    @Override
    @Transactional
    public ProductVariantResponse createVariant(ProductVariantRequest request) {
        if (request.getProductId() == null) {
            throw new ResourceNotFoundException("productId là bắt buộc");
        }

        Product product = productRepository.findById(request.getProductId())
            .orElseThrow(() -> new ResourceNotFoundException("Sản phẩm không tồn tại"));

        ProductVariant variant = new ProductVariant();
        variant.setProduct(product);
        variant.setCode(normalizeOrGenerateCode(request.getCode(), product.getCode()));
        variant.setBarcode(normalizeOrGenerateBarcode(request.getBarcode()));
        variant.setCostPrice(request.getCostPrice());
        variant.setSellingPrice(request.getSellingPrice());
        variant.setStockQuantity(request.getStockQuantity() != null ? request.getStockQuantity() : 0);
        variant.setBinLocation(request.getBinLocation());
        variant.setIsActive(request.getIsActive() != null ? request.getIsActive() : true);

        if (request.getAttributeValueIds() != null && !request.getAttributeValueIds().isEmpty()) {
            Set<AttributeValue> attributeValues = request.getAttributeValueIds().stream()
                .map(attrId -> attributeValueRepository.findById(attrId)
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thuộc tính ID: " + attrId)))
                .collect(Collectors.toSet());
            variant.setAttributeValues(attributeValues);
        }

        variant = variantRepository.save(variant);
        return mapToResponse(variant);
    }

    @Override
    @Transactional
    public ProductVariantResponse updateVariant(Long id, ProductVariantRequest request) {
        ProductVariant variant = variantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Variant không tồn tại"));

        if (request.getCode() != null && !request.getCode().isBlank()) variant.setCode(request.getCode().trim());
        if (request.getBarcode() != null && !request.getBarcode().isBlank()) variant.setBarcode(request.getBarcode().trim());
        if (request.getCostPrice() != null) variant.setCostPrice(request.getCostPrice());
        if (request.getSellingPrice() != null) variant.setSellingPrice(request.getSellingPrice());
        if (request.getStockQuantity() != null) variant.setStockQuantity(request.getStockQuantity());
        if (request.getBinLocation() != null) variant.setBinLocation(request.getBinLocation());
        if (request.getIsActive() != null) variant.setIsActive(request.getIsActive());

        if (request.getAttributeValueIds() != null) {
            Set<AttributeValue> attributeValues = request.getAttributeValueIds().stream()
                .map(attrId -> attributeValueRepository.findById(attrId)
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thuộc tính ID: " + attrId)))
                .collect(Collectors.toSet());
            variant.setAttributeValues(attributeValues);
        }

        variant = variantRepository.save(variant);
        return mapToResponse(variant);
    }

    @Override
    @Transactional
    public void deleteVariant(Long id) {
        ProductVariant variant = variantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Variant không tồn tại"));
        variant.setDeletedAt(LocalDateTime.now());
        variantRepository.save(variant);
    }

    @Override
    @Transactional
    public void createBulkVariants(VariantBulkRequest request) {

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Sản phẩm không tồn tại"));

        for (VariantBulkRequest.VariantItemRequest item : request.getVariants()) {

            ProductVariant variant = new ProductVariant();
            variant.setProduct(product);
            variant.setCode(normalizeOrGenerateCode(item.getCode(), product.getCode()));
            variant.setBarcode(normalizeOrGenerateBarcode(null));
            variant.setCostPrice(item.getCostPrice());
            variant.setSellingPrice(item.getSellingPrice());
            variant.setStockQuantity(item.getStockQuantity());
            variant.setIsActive(true);

            Set<AttributeValue> attributeValues = item.getAttributeValueIds().stream()
                    .map(attrId -> attributeValueRepository.findById(attrId)
                            .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thuộc tính ID: " + attrId)))
                    .collect(Collectors.toSet());

            variant.setAttributeValues(attributeValues);

            ProductVariant savedVariant = variantRepository.save(variant);

            if (item.getImageUrl() != null) {
                ProductImage img = new ProductImage();
                img.setProduct(product);
                img.setProductVariant(savedVariant);
                img.setImageUrl(item.getImageUrl());

                img.setIsPrimary(false);

                img.setDisplayOrder(0);
                productImageRepository.save(img);
            }
        }
    }
}