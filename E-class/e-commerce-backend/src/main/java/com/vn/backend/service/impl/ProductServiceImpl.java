    package com.vn.backend.service.impl;

    import com.vn.backend.dto.response.PageResponse;
    import com.vn.backend.dto.response.ProductDetailResponse;
    import com.vn.backend.dto.response.ProductListResponse;
    import com.vn.backend.dto.response.ProductVariantResponse;
    import com.vn.backend.entity.Product;
    import com.vn.backend.entity.ProductImage;
    import com.vn.backend.mapper.PageMapper;
    import com.vn.backend.repository.ProductRepository;
    import com.vn.backend.service.ProductService;
    import lombok.RequiredArgsConstructor;
    import org.springframework.data.domain.Page;
    import org.springframework.data.domain.PageRequest;
    import org.springframework.data.domain.Pageable;
    import org.springframework.stereotype.Service;

    import java.util.Comparator;
    import java.util.List;
    import java.util.stream.Collectors;
    @Service
    @RequiredArgsConstructor
    public class ProductServiceImpl implements ProductService {

        private final ProductRepository productRepository;

        @Override
        public PageResponse<ProductListResponse> getProductList(int page, int size) {

            Pageable pageable = PageRequest.of(page, size);

            Page<ProductListResponse> pageData =
                    productRepository.findProductList(pageable);

            return PageMapper.toPageResponse(pageData, dto -> dto);
        }


        @Override
        public ProductDetailResponse getProductDetail(Long id) {

            Product p = productRepository.findActiveDetailById(id)
                    .orElseThrow(() -> new RuntimeException("PRODUCT_NOT_FOUND"));
            p.getImages().size();
            p.getVariants().forEach(v -> v.getVariantAttributeValues().size());


            List<ProductVariantResponse> variants = p.getVariants().stream()
                    .filter(v -> Boolean.TRUE.equals(v.getIsActive()))
                    .map(v -> new ProductVariantResponse(
                            v.getId(),
                            v.getCode(),
                            v.getCostPrice(),
                            v.getSellingPrice(),
                            v.getStockQuantity(),
                            v.getIsActive(),
                            v.getVariantAttributeValues().stream()
                                    .collect(Collectors.toMap(
                                            av -> av.getAttributeValue()
                                                    .getAttribute()
                                                    .getCode(),
                                            av -> av.getAttributeValue().getValue(),
                                            (oldVal, newVal) -> oldVal
                                    ))
                    ))
                    .toList();


            List<String> images = p.getImages().stream()
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
