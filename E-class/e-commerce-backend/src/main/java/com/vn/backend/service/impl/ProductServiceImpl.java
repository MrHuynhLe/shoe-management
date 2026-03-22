package com.vn.backend.service.impl;

import com.vn.backend.dto.request.ProductCreateRequest;
import com.vn.backend.dto.response.PageResponse;
import com.vn.backend.dto.response.ProductDetailResponse;
import com.vn.backend.dto.response.ProductListResponse;
import com.vn.backend.dto.response.ProductVariantResponse;
import com.vn.backend.entity.*;
import com.vn.backend.mapper.PageMapper;
import com.vn.backend.repository.*;
import com.vn.backend.service.FileStorageService;
import com.vn.backend.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final BrandRepository brandRepository;
    private final OriginRepository originRepository;
    private final ProductImageRepository productImageRepository;
    private final ProductVariantRepository productVariantRepository;
    private final FileStorageService fileStorageService;
    private final SupplierRepository supplierRepository;

    @Override
    public Product create(ProductCreateRequest request) {
        if (productRepository.existsByCodeAndDeletedAtIsNull(request.getCode().trim())) {
            throw new RuntimeException("Mã sản phẩm đã tồn tại");
        }

        Brand brand = brandRepository.findById(request.getBrandId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thương hiệu"));

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy danh mục"));

        Origin origin = originRepository.findById(request.getOriginId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy xuất xứ"));

        Supplier supplier = supplierRepository.findById(request.getSupplierId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nhà cung cấp"));

        Product product = new Product();
        product.setName(request.getName().trim());
        product.setCode(request.getCode().trim());
        product.setDescription(request.getDescription());
        product.setBrand(brand);
        product.setCategory(category);
        product.setOrigin(origin);
        product.setSupplier(supplier);
        product.setIsActive(request.getIsActive() != null ? request.getIsActive() : true);
        product.setDeletedAt(null);

        return productRepository.save(product);
    }

    @Override
    public PageResponse<ProductListResponse> getProductList(int page, int size, Long categoryId) {
        Pageable pageable = PageRequest.of(page, size);
        Page<ProductListResponse> pageData = productRepository.findProductList(pageable, categoryId);
        return PageMapper.toPageResponse(pageData, dto -> dto);
    }

    @Override
    public ProductDetailResponse getProductDetail(Long id) {
        Product p = productRepository.findActiveDetailById(id)
                .orElseThrow(() -> new RuntimeException("PRODUCT_NOT_FOUND"));

        List<ProductVariant> productVariants = productVariantRepository.findByProductIdWithAttributes(id);

        List<ProductVariantResponse> variants = productVariants == null
                ? List.of()
                : productVariants.stream()
                .filter(v -> Boolean.TRUE.equals(v.getIsActive()))
                .map(v -> new ProductVariantResponse(
                        v.getId(),
                        v.getCode(),
                        v.getCostPrice(),
                        v.getSellingPrice(),
                        v.getStockQuantity(),
                        v.getIsActive(),
                        v.getVariantAttributeValues() == null
                                ? java.util.Collections.emptyMap()
                                : v.getVariantAttributeValues().stream()
                                .collect(Collectors.toMap(
                                        av -> av.getAttributeValue().getAttribute().getCode(),
                                        av -> av.getAttributeValue().getValue(),
                                        (oldVal, newVal) -> oldVal
                                ))
                ))
                .toList();

        List<String> images = p.getImages() == null
                ? List.of()
                : p.getImages().stream()
                .sorted(Comparator
                        .comparing((ProductImage img) -> Boolean.TRUE.equals(img.getIsPrimary()) ? 0 : 1)
                        .thenComparing(ProductImage::getDisplayOrder, Comparator.nullsLast(Integer::compareTo)))
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

    @Override
    public Product createWithImages(
            ProductCreateRequest request,
            MultipartFile primaryImage,
            List<MultipartFile> galleryImages) {

        if (productRepository.existsByCodeAndDeletedAtIsNull(request.getCode().trim())) {
            throw new RuntimeException("Mã sản phẩm đã tồn tại");
        }

        Brand brand = brandRepository.findById(request.getBrandId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thương hiệu"));

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy danh mục"));

        Origin origin = originRepository.findById(request.getOriginId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy xuất xứ"));

        Supplier supplier = supplierRepository.findById(request.getSupplierId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nhà cung cấp"));

        Product product = new Product();
        product.setName(request.getName().trim());
        product.setCode(request.getCode().trim());
        product.setDescription(request.getDescription());
        product.setBrand(brand);
        product.setCategory(category);
        product.setOrigin(origin);
        product.setSupplier(supplier);
        product.setIsActive(request.getIsActive() != null ? request.getIsActive() : true);
        product.setDeletedAt(null);

        product = productRepository.save(product);

        int order = 0;

        if (primaryImage != null && !primaryImage.isEmpty()) {
            String url = fileStorageService.store(primaryImage);

            ProductImage img = new ProductImage();
            img.setProduct(product);
            img.setImageUrl(url);
            img.setIsPrimary(true);
            img.setDisplayOrder(order++);
            productImageRepository.save(img);
        }

        if (galleryImages != null) {
            for (MultipartFile file : galleryImages) {
                if (file == null || file.isEmpty()) {
                    continue;
                }

                String url = fileStorageService.store(file);

                ProductImage img = new ProductImage();
                img.setProduct(product);
                img.setImageUrl(url);
                img.setIsPrimary(false);
                img.setDisplayOrder(order++);
                productImageRepository.save(img);
            }
        }

        return product;
    }

    @Override
    public String uploadSingleImage(MultipartFile file) {
        return fileStorageService.store(file);
    }
}