package com.vn.backend.repository;

import com.vn.backend.entity.Brand;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BrandRepository extends JpaRepository<Brand, Long> {
    List<Brand> findByDeletedAtIsNullAndIsActiveTrue();
}
