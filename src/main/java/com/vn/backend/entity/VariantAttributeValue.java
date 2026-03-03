package com.vn.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(
        name = "variant_attribute_values",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"variant_id", "attribute_value_id"})
        }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class VariantAttributeValue {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "variant_id", nullable = false)
    private ProductVariant variant;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "attribute_value_id", nullable = false)
    private AttributeValue attributeValue;
}
