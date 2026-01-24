package com.vn.backend.repository;

import com.vn.backend.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    List<Category> findByDeletedAtIsNullAndIsActiveTrue();
}
