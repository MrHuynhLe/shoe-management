package com.vn.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(
        name = "product_variants",
        indexes = {
                @Index(name = "idx_product_variants_barcode", columnList = "barcode")
        },
        uniqueConstraints = {
                @UniqueConstraint(name = "uq_product_variants_barcode", columnNames = {"barcode"})
        }
)
@Getter
@Setter
public class ProductVariant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String code;

    @Column(unique = true)
    private String barcode;

    @Column(name = "cost_price", nullable = false)
    private BigDecimal costPrice;

    @Column(name = "selling_price", nullable = false)
    private BigDecimal sellingPrice;

    @Column(name = "stock_quantity")
    private Integer stockQuantity = 0;

    @Column(name = "bin_location")
    private String binLocation;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(name = "deleted_at")
    private OffsetDateTime deletedAt;

    @OneToMany(mappedBy = "productVariant", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private List<ProductImage> images = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id")
    @JsonIgnoreProperties({"variants", "images"})
    private Product product;

    @OneToMany(mappedBy = "variant", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<VariantAttributeValue> variantAttributeValues = new ArrayList<>();
}