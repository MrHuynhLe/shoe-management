package com.vn.backend.repository;

import com.vn.backend.entity.VariantAttributeValue;
import com.vn.backend.entity.VariantAttributeValueId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface VariantAttributeValueRepository
        extends JpaRepository<VariantAttributeValue, VariantAttributeValueId> {

    @Query(value = "SELECT EXISTS (SELECT 1 FROM variant_attribute_values WHERE attribute_value_id = :id)", nativeQuery = true)
    boolean existsUsage(@Param("id") Long id);
}