package com.vn.backend.repository;

import com.vn.backend.dto.response.statistics.OverviewStatisticsProjection;
import com.vn.backend.dto.response.statistics.TopProductResponse;
import com.vn.backend.entity.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface StatisticsRepository extends JpaRepository<Order, Integer> {

    @Query(value = """
    SELECT
        COUNT(DISTINCT o.id) AS totalOrders,
        COALESCE(SUM(oi.quantity), 0) AS totalProductsSold,
        COALESCE(SUM(oi.quantity * oi.price_at_purchase), 0) AS totalRevenue,
        COUNT(DISTINCT o.customer_id) AS totalCustomers
    FROM orders o
    JOIN order_items oi ON oi.order_id = o.id
    WHERE o.status = 'COMPLETED'
      AND (:fromDate IS NULL OR o.created_at >= CAST(:fromDate AS timestamp))
      AND (:toDate IS NULL OR o.created_at < (CAST(:toDate AS timestamp) + INTERVAL '1 day'))
    """, nativeQuery = true)
    OverviewStatisticsProjection getOverviewStatistics(
            @Param("fromDate") String fromDate,
            @Param("toDate") String toDate
    );
    @Query(value = """
        SELECT
            p.id AS productId,
            p.code AS productCode,
            p.name AS productName,
            b.name AS brandName,
            c.name AS categoryName,
            COALESCE(SUM(oi.quantity), 0) AS totalSold,
            COALESCE(SUM(oi.quantity * oi.price_at_purchase), 0) AS revenue,
            COALESCE(SUM(oi.quantity * (oi.price_at_purchase - oi.cost_price_at_purchase)), 0) AS profit
        FROM order_items oi
        JOIN orders o ON o.id = oi.order_id
        JOIN product_variants pv ON pv.id = oi.product_variant_id
        JOIN products p ON p.id = pv.product_id
        LEFT JOIN brands b ON b.id = p.brand_id
        LEFT JOIN categories c ON c.id = p.category_id
        WHERE o.status = 'COMPLETED'
          AND (:fromDate IS NULL OR o.created_at >= CAST(:fromDate AS timestamp))
          AND (:toDate IS NULL OR o.created_at < (CAST(:toDate AS timestamp) + INTERVAL '1 day'))
        GROUP BY p.id, p.code, p.name, b.name, c.name
        ORDER BY revenue DESC
        """,
            countQuery = """
        SELECT COUNT(*) FROM (
            SELECT p.id
            FROM order_items oi
            JOIN orders o ON o.id = oi.order_id
            JOIN product_variants pv ON pv.id = oi.product_variant_id
            JOIN products p ON p.id = pv.product_id
            WHERE o.status = 'COMPLETED'
              AND (:fromDate IS NULL OR o.created_at >= CAST(:fromDate AS timestamp))
              AND (:toDate IS NULL OR o.created_at < (CAST(:toDate AS timestamp) + INTERVAL '1 day'))
            GROUP BY p.id
        ) x
        """,
            nativeQuery = true)
    Page<TopProductResponse> getTopProducts(
            @Param("fromDate") String fromDate,
            @Param("toDate") String toDate,
            Pageable pageable
    );
}