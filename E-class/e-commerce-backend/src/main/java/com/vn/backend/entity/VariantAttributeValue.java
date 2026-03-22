package com.vn.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "variant_attribute_values")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class VariantAttributeValue {

    @EmbeddedId
    private VariantAttributeValueId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("variantId")
    @JoinColumn(name = "variant_id", nullable = false)
    private ProductVariant variant;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("attributeValueId")
    @JoinColumn(name = "attribute_value_id", nullable = false)
    private AttributeValue attributeValue;
}