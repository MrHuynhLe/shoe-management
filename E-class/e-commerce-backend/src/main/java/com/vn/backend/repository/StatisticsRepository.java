package com.vn.backend.repository;

import com.vn.backend.dto.response.statistics.OverviewStatisticsProjection;
import com.vn.backend.dto.response.statistics.TopProductResponse;
import com.vn.backend.entity.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface StatisticsRepository extends JpaRepository<Order, Integer> {
    @Query(value = """
    WITH order_summary AS (
        SELECT
            o.id AS order_id,
            DATE_TRUNC('day', o.created_at) AS bucket,
            COALESCE(SUM(oi.quantity), 0) AS items_sold,
            COALESCE(SUM(oi.quantity * (oi.price_at_purchase - oi.cost_price_at_purchase)), 0) AS profit,
            GREATEST(
                COALESCE(SUM(oi.quantity * oi.price_at_purchase), 0) - COALESCE(o.discount_amount, 0),
                0
            ) AS revenue
        FROM orders o
        JOIN order_items oi ON oi.order_id = o.id
        WHERE o.status = 'COMPLETED'
          AND (:fromDate IS NULL OR o.created_at >= CAST(:fromDate AS timestamp))
          AND (:toDate IS NULL OR o.created_at < (CAST(:toDate AS timestamp) + INTERVAL '1 day'))
        GROUP BY o.id, DATE_TRUNC('day', o.created_at), o.discount_amount
    )
    SELECT
        TO_CHAR(bucket, 'YYYY-MM-DD') AS label,
        COUNT(order_id) AS totalOrders,
        COALESCE(SUM(revenue), 0) AS revenue,
        COALESCE(SUM(items_sold), 0) AS itemsSold,
        COALESCE(SUM(profit), 0) AS profit
    FROM order_summary
    GROUP BY bucket
    ORDER BY bucket
""", nativeQuery = true)
    List<Object[]> getRevenueByDay(
            @Param("fromDate") String fromDate,
            @Param("toDate") String toDate
    );

    @Query(value = """
    WITH order_summary AS (
        SELECT
            o.id AS order_id,
            DATE_TRUNC('week', o.created_at) AS bucket,
            COALESCE(SUM(oi.quantity), 0) AS items_sold,
            COALESCE(SUM(oi.quantity * (oi.price_at_purchase - oi.cost_price_at_purchase)), 0) AS profit,
            GREATEST(
                COALESCE(SUM(oi.quantity * oi.price_at_purchase), 0) - COALESCE(o.discount_amount, 0),
                0
            ) AS revenue
        FROM orders o
        JOIN order_items oi ON oi.order_id = o.id
        WHERE o.status = 'COMPLETED'
          AND (:fromDate IS NULL OR o.created_at >= CAST(:fromDate AS timestamp))
          AND (:toDate IS NULL OR o.created_at < (CAST(:toDate AS timestamp) + INTERVAL '1 day'))
        GROUP BY o.id, DATE_TRUNC('week', o.created_at), o.discount_amount
    )
    SELECT
        TO_CHAR(bucket, 'YYYY-MM-DD') AS label,
        COUNT(order_id) AS totalOrders,
        COALESCE(SUM(revenue), 0) AS revenue,
        COALESCE(SUM(items_sold), 0) AS itemsSold,
        COALESCE(SUM(profit), 0) AS profit
    FROM order_summary
    GROUP BY bucket
    ORDER BY bucket
""", nativeQuery = true)
    List<Object[]> getRevenueByWeek(
            @Param("fromDate") String fromDate,
            @Param("toDate") String toDate
    );

    @Query(value = """
    WITH order_summary AS (
        SELECT
            o.id AS order_id,
            DATE_TRUNC('month', o.created_at) AS bucket,
            COALESCE(SUM(oi.quantity), 0) AS items_sold,
            COALESCE(SUM(oi.quantity * (oi.price_at_purchase - oi.cost_price_at_purchase)), 0) AS profit,
            GREATEST(
                COALESCE(SUM(oi.quantity * oi.price_at_purchase), 0) - COALESCE(o.discount_amount, 0),
                0
            ) AS revenue
        FROM orders o
        JOIN order_items oi ON oi.order_id = o.id
        WHERE o.status = 'COMPLETED'
          AND (:fromDate IS NULL OR o.created_at >= CAST(:fromDate AS timestamp))
          AND (:toDate IS NULL OR o.created_at < (CAST(:toDate AS timestamp) + INTERVAL '1 day'))
        GROUP BY o.id, DATE_TRUNC('month', o.created_at), o.discount_amount
    )
    SELECT
        TO_CHAR(bucket, 'YYYY-MM') AS label,
        COUNT(order_id) AS totalOrders,
        COALESCE(SUM(revenue), 0) AS revenue,
        COALESCE(SUM(items_sold), 0) AS itemsSold,
        COALESCE(SUM(profit), 0) AS profit
    FROM order_summary
    GROUP BY bucket
    ORDER BY bucket
""", nativeQuery = true)
    List<Object[]> getRevenueByMonth(
            @Param("fromDate") String fromDate,
            @Param("toDate") String toDate
    );

    @Query(value = """
    WITH order_summary AS (
        SELECT
            o.id AS order_id,
            o.customer_id AS customer_id,
            COALESCE(SUM(oi.quantity), 0) AS total_products_sold,
            GREATEST(
                COALESCE(SUM(oi.quantity * oi.price_at_purchase), 0) - COALESCE(o.discount_amount, 0),
                0
            ) AS total_revenue
        FROM orders o
        JOIN order_items oi ON oi.order_id = o.id
        WHERE o.status = 'COMPLETED'
          AND (:fromDate IS NULL OR o.created_at >= CAST(:fromDate AS timestamp))
          AND (:toDate IS NULL OR o.created_at < (CAST(:toDate AS timestamp) + INTERVAL '1 day'))
        GROUP BY o.id, o.customer_id, o.discount_amount
    )
    SELECT
        COUNT(order_id) AS totalOrders,
        COALESCE(SUM(total_products_sold), 0) AS totalProductsSold,
        COALESCE(SUM(total_revenue), 0) AS totalRevenue,
        COUNT(DISTINCT customer_id) AS totalCustomers
    FROM order_summary
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
    ORDER BY totalSold DESC, revenue DESC
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

    @Query(value = """
    SELECT
        o.status AS status,
        COUNT(*) AS totalOrders,
        COALESCE(SUM(
            GREATEST(
                COALESCE((
                    SELECT SUM(oi.quantity * oi.price_at_purchase)
                    FROM order_items oi
                    WHERE oi.order_id = o.id
                ), 0) - COALESCE(o.discount_amount, 0),
                0
            )
        ), 0) AS totalAmount
    FROM orders o
    WHERE o.status IN ('PENDING', 'CONFIRMED', 'SHIPPING', 'COMPLETED', 'CANCELLED')
      AND (:fromDate IS NULL OR o.created_at >= CAST(:fromDate AS timestamp))
      AND (:toDate IS NULL OR o.created_at < (CAST(:toDate AS timestamp) + INTERVAL '1 day'))
    GROUP BY o.status
    ORDER BY totalOrders DESC, o.status ASC
    """, nativeQuery = true)
    List<Object[]> getOrderStatusStatistics(
            @Param("fromDate") String fromDate,
            @Param("toDate") String toDate
    );

    @Query(value = """
SELECT
    COALESCE(pm.code, 'UNKNOWN') AS paymentMethodCode,
    COALESCE(pm.name, 'Khác') AS paymentMethodName,
    COUNT(DISTINCT o.id) AS totalOrders,
    COALESCE(SUM(
        GREATEST(
            COALESCE((
                SELECT SUM(oi.quantity * oi.price_at_purchase)
                FROM order_items oi
                WHERE oi.order_id = o.id
            ), 0) - COALESCE(o.discount_amount, 0),
            0
        )
    ), 0) AS revenue
FROM payments p
JOIN orders o ON o.id = p.order_id
LEFT JOIN payment_methods pm ON pm.id = p.payment_method_id
WHERE o.status = 'COMPLETED'
  AND (:fromDate IS NULL OR o.created_at >= CAST(:fromDate AS timestamp))
  AND (:toDate IS NULL OR o.created_at < (CAST(:toDate AS timestamp) + INTERVAL '1 day'))
GROUP BY pm.code, pm.name
ORDER BY revenue DESC, paymentMethodName ASC
""", nativeQuery = true)
    List<Object[]> getRevenueByPaymentMethod(
            @Param("fromDate") String fromDate,
            @Param("toDate") String toDate
    );
}