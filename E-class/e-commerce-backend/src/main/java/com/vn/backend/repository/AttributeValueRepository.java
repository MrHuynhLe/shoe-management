package com.vn.backend.repository;

import com.vn.backend.entity.AttributeValue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AttributeValueRepository extends JpaRepository<AttributeValue, Long> {

    @Query("""
        select av
        from AttributeValue av
        join av.attribute a
        where upper(a.code) = upper(:code)
          and av.isActive = true
        order by av.id desc
    """)
    List<AttributeValue> findActiveByAttributeCode(@Param("code") String code);

    List<AttributeValue> findByAttribute_IdOrderByIdDesc(Long attributeId);
    List<AttributeValue> findByAttribute_CodeAndIsActiveTrueOrderByIdDesc(String code);
    boolean existsByAttribute_IdAndValueIgnoreCase(Long attributeId, String value);
}