package com.vn.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(
        name = "promotion_variant",
        indexes = {
                @Index(name = "idx_promotion_variant_promotion", columnList = "promotion_id"),
                @Index(name = "idx_promotion_variant_variant", columnList = "variant_id")
        }
)
@Getter
@Setter
public class PromotionVariant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "promotion_id", nullable = false)
    private ProductPromotionCampaign promotion;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "variant_id", nullable = false)
    private ProductVariant variant;
}
