package com.vn.backend.service.impl;


import com.vn.backend.dto.request.ProductVariantCreateRequest;
import com.vn.backend.dto.response.ProductVariantResponse;
import com.vn.backend.entity.AttributeValue;
import com.vn.backend.entity.Product;
import com.vn.backend.entity.ProductVariant;
import com.vn.backend.entity.VariantAttributeValue;
import com.vn.backend.repository.AttributeValueRepository;
import com.vn.backend.repository.ProductRepository;
import com.vn.backend.repository.ProductVariantRepository;
import com.vn.backend.repository.VariantAttributeValueRepository;
import com.vn.backend.service.ProductVariantService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductVariantServiceImpl implements ProductVariantService {

    private final ProductVariantRepository productVariantRepository;
    private final ProductRepository productRepository;
    private final VariantAttributeValueRepository variantAttributeValueRepository;
    private final AttributeValueRepository attributeValueRepository; // ✅ thêm


    // ================= GET ALL =================
    @Override
    public List<ProductVariantResponse> getAllVariants() {

        return productVariantRepository.findAllActiveWithAttributes()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // ================= GET BY PRODUCT =================
    @Override
    public List<ProductVariantResponse> getVariantsByProduct(Long productId) {

        return productVariantRepository.findByProductIdWithAttributes(productId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // ================= GET DETAIL =================
    @Override
    public ProductVariantResponse getVariantDetail(Long id) {

        ProductVariant variant = productVariantRepository.findActiveById(id)
                .orElseThrow(() ->
                        new RuntimeException("Product variant not found with id: " + id)
                );

        return toResponse(variant);
    }



    // create
    @Override
    public ProductVariantResponse create(ProductVariantCreateRequest request) {
        // 1️⃣ LẤY PRODUCT
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("Product không tồn tại"));

        // 2️⃣ LẤY ATTRIBUTE VALUES
        List<AttributeValue> attributeValues =
                attributeValueRepository.findAllById(request.getAttributeValueIds());

        if (attributeValues.isEmpty()) {
            throw new RuntimeException("AttributeValue không hợp lệ");
        }

        // 3️⃣ SINH CODE TỪ ATTRIBUTE
        String code = generateVariantCode(product, attributeValues);

        // 4️⃣ CHECK TRÙNG CODE (QUAN TRỌNG)
        if (productVariantRepository.existsByCodeAndDeletedAtIsNull(code)) {
            throw new RuntimeException("Variant đã tồn tại: " + code);
        }

        // 5️⃣ TẠO VARIANT
        ProductVariant variant = new ProductVariant();
        variant.setProduct(product);
        variant.setBarcode(generateBarcode());
        variant.setBarcode(code); // hoặc sinh barcode riêng
        variant.setSellingPrice(request.getSellingPrice());
        variant.setCostPrice(request.getCostPrice());
        variant.setStockQuantity(request.getStockQuantity());
        variant.setIsActive(true);

        // 6️⃣ SAVE VARIANT TRƯỚC
        productVariantRepository.save(variant);

        // 7️⃣ GẮN ATTRIBUTE ↔ VARIANT
        List<VariantAttributeValue> vavs = attributeValues.stream()
                .map(av -> {
                    VariantAttributeValue vav = new VariantAttributeValue();
                    vav.setVariant(variant);
                    vav.setAttributeValue(av);
                    return vav;
                })
                .toList();

        variantAttributeValueRepository.saveAll(vavs);
        variant.setVariantAttributeValues(vavs);

        // 8️⃣ RETURN RESPONSE
        return toResponse(variant);
    }
    // ================= MAPPER =================
    private ProductVariantResponse toResponse(ProductVariant variant) {

        List<VariantAttributeValue> vavs =
                Optional.ofNullable(variant.getVariantAttributeValues())
                        .orElse(List.of());

        Map<String, String> attributes = vavs.stream()
                .collect(Collectors.toMap(
                        v -> v.getAttributeValue().getAttribute().getCode(),
                        v -> v.getAttributeValue().getValue(),
                        (a, b) -> a // tránh crash nếu trùng key
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
    // TỰ SINH
    private String generateVariantCode(Product product, List<AttributeValue> values) {

        String attrPart = values.stream()
                .map(AttributeValue::getValue)
                .sorted()
                .collect(Collectors.joining("-"));

        return product.getCode() + "-" + attrPart;
    }
    // CODE TỰ SINH
    private String generateBarcode() {
        return "BC" + System.currentTimeMillis();
    }
}