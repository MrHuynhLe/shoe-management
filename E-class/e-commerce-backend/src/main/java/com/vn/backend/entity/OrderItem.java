package com.vn.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "order_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_variant_id", nullable = false)
    private ProductVariant productVariant;

    @Column(nullable = false)
    private Integer quantity;

    /**
     * The cost price of the product variant at the time of purchase.
     */
    @Column(name = "cost_price_at_purchase", nullable = false, precision = 15, scale = 2)
    private BigDecimal costPriceAtPurchase;

    /**
     * The effective unit price at the time of purchase after product promotion.
     */
    @Column(name = "price_at_purchase", nullable = false, precision = 15, scale = 2)
    private BigDecimal priceAtPurchase;

    @Column(name = "original_price_at_purchase", precision = 15, scale = 2)
    private BigDecimal originalPriceAtPurchase;

    @Column(name = "product_discount_percent", precision = 5, scale = 2)
    private BigDecimal productDiscountPercent;

    @Column(name = "product_discount_amount", precision = 15, scale = 2)
    private BigDecimal productDiscountAmount;

    @Column(name = "promotion_id")
    private Long promotionId;

    @Column(name = "line_total", precision = 15, scale = 2)
    private BigDecimal lineTotal;
}
