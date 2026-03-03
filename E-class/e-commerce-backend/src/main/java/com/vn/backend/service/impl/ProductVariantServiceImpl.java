package com.vn.backend.service.impl;

import com.vn.backend.dto.request.ProductVariantRequest;
import com.vn.backend.dto.response.ProductVariantResponse;
import com.vn.backend.entity.AttributeValue;
import com.vn.backend.entity.Product;
import com.vn.backend.entity.ProductVariant;
import com.vn.backend.repository.AttributeValueRepository;
import com.vn.backend.repository.ProductRepository;
import com.vn.backend.repository.ProductVariantRepository;
import com.vn.backend.service.ProductVariantService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductVariantServiceImpl implements ProductVariantService {

    private final ProductVariantRepository variantRepository;
    private final ProductRepository productRepository;
    private final AttributeValueRepository attributeValueRepository;

    // ─── Barcode tự động sinh: BC + productId (4 chữ số) + UUID 8 ký tự đầu ─────────
    private String generateBarcode(Long productId) {
        String uuid = UUID.randomUUID().toString().replace("-", "").toUpperCase();
        return String.format("BC%04d%s", productId, uuid.substring(0, 8));
    }

    // ─── SKU code tự động: SKU-{productCode}-{timestamp 6 số cuối} ──────────────────
    private String generateSkuCode(Product product) {
        String ts = String.valueOf(System.currentTimeMillis());
        String suffix = ts.substring(ts.length() - 6);
        return "SKU-" + product.getCode() + "-" + suffix;
    }

    // ─── Mapping entity → response ───────────────────────────────────────────────────
    private ProductVariantResponse mapToResponse(ProductVariant v) {
        ProductVariantResponse res = new ProductVariantResponse();
        res.setId(v.getId());
        res.setProductId(v.getProduct().getId());
        res.setProductName(v.getProduct().getName());
        res.setCode(v.getCode());
        res.setBarcode(v.getBarcode());
        res.setCostPrice(v.getCostPrice());
        res.setSellingPrice(v.getSellingPrice());
        res.setStockQuantity(v.getStockQuantity());
        res.setBinLocation(v.getBinLocation());
        res.setIsActive(v.getIsActive());
        res.setDeletedAt(v.getDeletedAt());

        if (v.getAttributeValues() != null) {
            List<ProductVariantResponse.AttributeValueInfo> attrs = v.getAttributeValues().stream()
                .map(av -> {
                    ProductVariantResponse.AttributeValueInfo info = new ProductVariantResponse.AttributeValueInfo();
                    info.setAttributeValueId(av.getId());
                    info.setAttributeId(av.getAttribute().getId());
                    info.setAttributeCode(av.getAttribute().getCode());
                    info.setAttributeName(av.getAttribute().getName());
                    info.setValue(av.getValue());
                    return info;
                })
                .collect(Collectors.toList());
            res.setAttributes(attrs);
        }
        return res;
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
        ProductVariant v = variantRepository.findById(id)
            .filter(pv -> pv.getDeletedAt() == null)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy variant với id: " + id));
        return mapToResponse(v);
    }

    @Override
    public ProductVariantResponse getVariantByCode(String code) {
        ProductVariant v = variantRepository.findByCodeAndDeletedAtIsNull(code)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy variant với code: " + code));
        return mapToResponse(v);
    }

    @Override
    public ProductVariantResponse getVariantByBarcode(String barcode) {
        ProductVariant v = variantRepository.findByBarcodeAndDeletedAtIsNull(barcode)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy variant với barcode: " + barcode));
        return mapToResponse(v);
    }

    @Override
    public ProductVariantResponse createVariant(ProductVariantRequest request) {
        Product product = productRepository.findById(request.getProductId())
            .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm với id: " + request.getProductId()));

        ProductVariant v = new ProductVariant();
        v.setProduct(product);

        // SKU code: dùng request.code nếu có, không thì tự sinh
        if (request.getCode() != null && !request.getCode().isBlank()) {
            if (variantRepository.existsByCode(request.getCode())) {
                throw new RuntimeException("SKU code đã tồn tại: " + request.getCode());
            }
            v.setCode(request.getCode());
        } else {
            String code;
            do {
                code = generateSkuCode(product);
            } while (variantRepository.existsByCode(code));
            v.setCode(code);
        }

        // Barcode: luôn tự động sinh
        String barcode;
        do {
            barcode = generateBarcode(product.getId());
        } while (variantRepository.existsByBarcode(barcode));
        v.setBarcode(barcode);

        v.setCostPrice(request.getCostPrice());
        v.setSellingPrice(request.getSellingPrice());
        v.setStockQuantity(request.getStockQuantity() != null ? request.getStockQuantity() : 0);
        v.setBinLocation(request.getBinLocation());
        v.setIsActive(request.getIsActive() != null ? request.getIsActive() : true);

        // Gán attribute values (Size, Color,...)
        if (request.getAttributeValueIds() != null && !request.getAttributeValueIds().isEmpty()) {
            Set<AttributeValue> avSet = new HashSet<>();
            for (Long avId : request.getAttributeValueIds()) {
                AttributeValue av = attributeValueRepository.findById(avId)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy AttributeValue id: " + avId));
                avSet.add(av);
            }
            v.setAttributeValues(avSet);
        }

        return mapToResponse(variantRepository.save(v));
    }

    @Override
    public ProductVariantResponse updateVariant(Long id, ProductVariantRequest request) {
        ProductVariant v = variantRepository.findById(id)
            .filter(pv -> pv.getDeletedAt() == null)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy variant với id: " + id));

        if (request.getProductId() != null) {
            Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm id: " + request.getProductId()));
            v.setProduct(product);
        }

        if (request.getCode() != null && !request.getCode().isBlank()
            && !request.getCode().equals(v.getCode())) {
            if (variantRepository.existsByCode(request.getCode())) {
                throw new RuntimeException("SKU code đã tồn tại: " + request.getCode());
            }
            v.setCode(request.getCode());
        }

        if (request.getCostPrice() != null) v.setCostPrice(request.getCostPrice());
        if (request.getSellingPrice() != null) v.setSellingPrice(request.getSellingPrice());
        if (request.getStockQuantity() != null) v.setStockQuantity(request.getStockQuantity());
        if (request.getBinLocation() != null) v.setBinLocation(request.getBinLocation());
        if (request.getIsActive() != null) v.setIsActive(request.getIsActive());

        if (request.getAttributeValueIds() != null) {
            Set<AttributeValue> avSet = new HashSet<>();
            for (Long avId : request.getAttributeValueIds()) {
                AttributeValue av = attributeValueRepository.findById(avId)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy AttributeValue id: " + avId));
                avSet.add(av);
            }
            v.setAttributeValues(avSet);
        }

        return mapToResponse(variantRepository.save(v));
    }

    @Override
    public void deleteVariant(Long id) {
        ProductVariant v = variantRepository.findById(id)
            .filter(pv -> pv.getDeletedAt() == null)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy variant với id: " + id));
        v.setDeletedAt(LocalDateTime.now());
        variantRepository.save(v);
    }
}
