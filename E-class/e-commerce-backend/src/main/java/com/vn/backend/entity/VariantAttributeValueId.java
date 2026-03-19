package com.vn.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Embeddable
@Data
@NoArgsConstructor
@AllArgsConstructor
public class VariantAttributeValueId implements Serializable {

    @Column(name = "variant_id")
    private Long variantId;

    @Column(name = "attribute_value_id")
    private Long attributeValueId;
}