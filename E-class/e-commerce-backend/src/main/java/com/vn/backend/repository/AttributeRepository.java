package com.vn.backend.repository;

import com.vn.backend.entity.Attribute;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AttributeRepository extends JpaRepository<Attribute, Long> {
    Optional<Attribute> findByCode(String code);
    List<Attribute> findByNameContainingIgnoreCase(String name);
    boolean existsByCode(String code);
}
