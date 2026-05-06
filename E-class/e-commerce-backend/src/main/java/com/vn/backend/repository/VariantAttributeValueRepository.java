package com.vn.backend.repository;

import com.vn.backend.entity.VariantAttributeValue;
import com.vn.backend.entity.VariantAttributeValueId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

public interface VariantAttributeValueRepository
        extends JpaRepository<VariantAttributeValue, VariantAttributeValueId> {

    @Modifying
    @Query("delete from VariantAttributeValue v where v.variant.id = :variantId")
    void deleteByVariantId(Long variantId);
}