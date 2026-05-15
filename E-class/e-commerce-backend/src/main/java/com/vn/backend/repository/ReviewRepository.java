package com.vn.backend.repository;

import com.vn.backend.entity.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    @EntityGraph(attributePaths = {"product", "user", "user.userProfile"})
    List<Review> findByProductIdAndStatusTrueOrderByCreatedAtDesc(Long productId);

    boolean existsByOrderItemIdAndStatusTrue(Long orderItemId);

    java.util.Optional<Review> findByOrderItemIdAndStatusTrue(Long orderItemId);

    long countByProductIdAndStatusTrue(Long productId);

    @Query("""
            select coalesce(avg(r.rating), 0)
            from Review r
            where r.product.id = :productId
              and r.status = true
            """)
    Double getAverageRatingByProductId(@Param("productId") Long productId);

    @Override
    @EntityGraph(attributePaths = {"product", "user", "user.userProfile"})
    Page<Review> findAll(Pageable pageable);
}
