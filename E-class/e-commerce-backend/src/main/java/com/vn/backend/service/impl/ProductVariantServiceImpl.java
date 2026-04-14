package com.vn.backend.service.impl;

import com.vn.backend.dto.request.ProductVariantCreateRequest;
import com.vn.backend.dto.request.VariantBulkRequest;
import com.vn.backend.dto.response.ProductVariantResponse;
import com.vn.backend.entity.AttributeValue;
import com.vn.backend.entity.Product;
import com.vn.backend.entity.ProductVariant;
import com.vn.backend.entity.VariantAttributeValue;
import com.vn.backend.entity.VariantAttributeValueId;
import com.vn.backend.repository.AttributeValueRepository;
import com.vn.backend.repository.ProductRepository;
import com.vn.backend.repository.ProductVariantRepository;
import com.vn.backend.repository.VariantAttributeValueRepository;
import com.vn.backend.service.ProductVariantService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import java.text.Normalizer;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.time.OffsetDateTime;
import java.util.Map;
import java.util.Set;
import java.util.TreeSet;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ProductVariantServiceImpl implements ProductVariantService {

    private final ProductRepository productRepository;
    private final ProductVariantRepository productVariantRepository;
    private final AttributeValueRepository attributeValueRepository;
    private final VariantAttributeValueRepository variantAttributeValueRepository;

    @Override
    public ProductVariantResponse create(ProductVariantCreateRequest request) {
        return createInternal(
                request.getProductId(),
                request.getCode(),
                request.getBarcode(),
                request.getCostPrice(),
                request.getSellingPrice(),
                request.getStockQuantity(),
                request.getBinLocation(),
                request.getIsActive(),
                request.getAttributeValueIds()
        );
    }

    @Override
    public List<ProductVariantResponse> createBulk(VariantBulkRequest request) {
        List<ProductVariantResponse> result = new ArrayList<>();

        for (VariantBulkRequest.VariantItemRequest item : request.getVariants()) {
            result.add(
                    createInternal(
                            request.getProductId(),
                            item.getCode(),
                            item.getBarcode(),
                            item.getCostPrice(),
                            item.getSellingPrice(),
                            item.getStockQuantity(),
                            item.getBinLocation(),
                            true,
                            item.getAttributeValueIds()
                    )
            );
        }

        return result;
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductVariantResponse> getByProductId(Long productId) {
        return productVariantRepository.findByProductIdWithAttributes(productId)
                .stream()
                .filter(v -> v.getDeletedAt() == null)
                .map(this::toResponseFromEntity)
                .toList();
    }

    @Override
    @Transactional
    public void delete(Long variantId) {
        ProductVariant variant = productVariantRepository.findById(variantId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy biến thể với ID: " + variantId));

        if (variant.getDeletedAt() != null) {
            throw new RuntimeException("Biến thể đã bị xóa trước đó.");
        }

        variant.setDeletedAt(OffsetDateTime.now());
        productVariantRepository.save(variant);
    }

    private ProductVariantResponse createInternal(
            Long productId,
            String code,
            String barcode,
            BigDecimal costPrice,
            BigDecimal sellingPrice,
            Integer stockQuantity,
            String binLocation,
            Boolean isActive,
            List<Long> attributeValueIds
    ) {
        if (costPrice == null || sellingPrice == null) {
            throw new RuntimeException("Giá nhập và giá bán không được để trống");
        }

        if (costPrice.compareTo(BigDecimal.ZERO) < 0 || sellingPrice.compareTo(BigDecimal.ZERO) < 0) {
            throw new RuntimeException("Giá nhập và giá bán phải lớn hơn hoặc bằng 0");
        }

        Product product = productRepository.findByIdAndDeletedAtIsNull(productId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm"));

        String trimmedBarcode = null;
        if (barcode != null && !barcode.isBlank()) {
            trimmedBarcode = barcode.trim();
            if (productVariantRepository.existsByBarcodeAndDeletedAtIsNull(trimmedBarcode)) {
                throw new RuntimeException("Barcode đã tồn tại");
            }
        }

        if (attributeValueIds == null || attributeValueIds.isEmpty()) {
            throw new RuntimeException("Biến thể phải có ít nhất 1 thuộc tính");
        }

        List<Long> distinctAttributeValueIds = new ArrayList<>(new LinkedHashSet<>(attributeValueIds));
        if (distinctAttributeValueIds.size() != attributeValueIds.size()) {
            throw new RuntimeException("Danh sách thuộc tính đang bị trùng");
        }

        List<AttributeValue> attributeValues = attributeValueRepository.findAllById(distinctAttributeValueIds);

        if (attributeValues.size() != distinctAttributeValueIds.size()) {
            throw new RuntimeException("Có thuộc tính không tồn tại");
        }

        validateNoDuplicateAttributeType(attributeValues);
        validateDuplicateCombination(productId, attributeValues);

        String resolvedCode = resolveVariantCode(product, code, attributeValues);

        if (productVariantRepository.existsByCodeAndDeletedAtIsNull(resolvedCode)) {
            throw new RuntimeException("Mã biến thể đã tồn tại");
        }

        ProductVariant variant = new ProductVariant();
        variant.setProduct(product);
        variant.setCode(resolvedCode);
        variant.setBarcode(trimmedBarcode);
        variant.setCostPrice(costPrice);
        variant.setSellingPrice(sellingPrice);
        variant.setStockQuantity(stockQuantity == null ? 0 : stockQuantity);
        variant.setBinLocation(binLocation);
        variant.setIsActive(isActive != null ? isActive : true);
        variant.setDeletedAt(null);

        variant = productVariantRepository.saveAndFlush(variant);

        for (AttributeValue av : attributeValues) {
            VariantAttributeValue link = new VariantAttributeValue();
            link.setId(new VariantAttributeValueId(variant.getId(), av.getId()));
            link.setVariant(variant);
            link.setAttributeValue(av);
            variantAttributeValueRepository.saveAndFlush(link);
        }

        return toResponseFromCreatedData(variant, attributeValues);
    }

    private void validateNoDuplicateAttributeType(List<AttributeValue> attributeValues) {
        Map<String, Long> counts = attributeValues.stream()
                .collect(Collectors.groupingBy(
                        av -> av.getAttribute().getCode().toUpperCase(),
                        Collectors.counting()
                ));

        boolean hasDuplicateType = counts.values().stream().anyMatch(count -> count > 1);
        if (hasDuplicateType) {
            throw new RuntimeException("Một biến thể không được chứa 2 giá trị cùng loại thuộc tính");
        }
    }

    private void validateDuplicateCombination(Long productId, List<AttributeValue> newValues) {
        Set<Long> newSet = newValues.stream()
                .map(AttributeValue::getId)
                .collect(Collectors.toCollection(TreeSet::new));

        List<ProductVariant> existingVariants = productVariantRepository.findByProductIdWithAttributes(productId);

        for (ProductVariant existing : existingVariants) {
            if (existing.getDeletedAt() != null) {
                continue;
            }

            Set<Long> existingSet = existing.getVariantAttributeValues().stream()
                    .map(v -> v.getAttributeValue().getId())
                    .collect(Collectors.toCollection(TreeSet::new));

            if (existingSet.equals(newSet)) {
                throw new RuntimeException("Biến thể với tổ hợp thuộc tính này đã tồn tại");
            }
        }
    }

    private ProductVariantResponse toResponseFromCreatedData(ProductVariant variant, List<AttributeValue> attributeValues) {
        Map<String, String> attributes = attributeValues == null
                ? Collections.emptyMap()
                : attributeValues.stream()
                .collect(Collectors.toMap(
                        av -> av.getAttribute().getCode(),
                        AttributeValue::getValue,
                        (oldVal, newVal) -> oldVal,
                        LinkedHashMap::new
                ));

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

    private ProductVariantResponse toResponseFromEntity(ProductVariant variant) {
        Map<String, String> attributes = variant.getVariantAttributeValues() == null
                ? Collections.emptyMap()
                : variant.getVariantAttributeValues().stream()
                .collect(Collectors.toMap(
                        v -> v.getAttributeValue().getAttribute().getCode(),
                        v -> v.getAttributeValue().getValue(),
                        (oldVal, newVal) -> oldVal,
                        LinkedHashMap::new
                ));

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

    private String resolveVariantCode(
            Product product,
            String requestedCode,
            List<AttributeValue> attributeValues
    ) {
        if (StringUtils.hasText(requestedCode)) {
            return ensureUniqueVariantCode(normalizeCode(requestedCode));
        }

        String color = attributeValues.stream()
                .filter(av -> "COLOR".equalsIgnoreCase(av.getAttribute().getCode()))
                .map(AttributeValue::getValue)
                .findFirst()
                .orElse("COLOR");

        String size = attributeValues.stream()
                .filter(av -> "SIZE".equalsIgnoreCase(av.getAttribute().getCode()))
                .map(AttributeValue::getValue)
                .findFirst()
                .orElse("SIZE");

        String baseCode = normalizeCode(product.getCode() + "-" + color + "-" + size);
        return ensureUniqueVariantCode(baseCode);
    }

    private String ensureUniqueVariantCode(String baseCode) {
        String candidate = baseCode;
        int counter = 1;

        while (productVariantRepository.existsByCodeAndDeletedAtIsNull(candidate)) {
            candidate = baseCode + "-" + String.format("%02d", counter++);
        }

        return candidate;
    }

    private String normalizeCode(String input) {
        if (!StringUtils.hasText(input)) {
            return "";
        }

        String normalized = Normalizer.normalize(input, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .replace("đ", "d")
                .replace("Đ", "D")
                .trim()
                .toUpperCase()
                .replaceAll("[^A-Z0-9\\s-]", "")
                .replaceAll("\\s+", "-")
                .replaceAll("-+", "-")
                .replaceAll("^-|-$", "");

        return normalized.length() > 50 ? normalized.substring(0, 50) : normalized;
    }
}