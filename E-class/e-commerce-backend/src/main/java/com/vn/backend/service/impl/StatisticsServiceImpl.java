package com.vn.backend.service.impl;

import com.vn.backend.dto.request.StatisticsQuery;
import com.vn.backend.dto.response.PageResponse;
import com.vn.backend.dto.response.statistics.*;
import com.vn.backend.repository.StatisticsRepository;
import com.vn.backend.service.StatisticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
public class StatisticsServiceImpl implements StatisticsService {

    private final StatisticsRepository statisticsRepository;

    @Override
    public OverviewStatisticsResponse getOverview(StatisticsQuery query) {
        OverviewStatisticsProjection result = statisticsRepository.getOverviewStatistics(
                query.getFrom() != null ? query.getFrom().toString() : null,
                query.getTo() != null ? query.getTo().toString() : null
        );

        if (result == null) {
            return new OverviewStatisticsResponse(0L, 0L, 0.0, 0L);
        }

        return new OverviewStatisticsResponse(
                result.getTotalOrders() != null ? result.getTotalOrders() : 0L,
                result.getTotalProductsSold() != null ? result.getTotalProductsSold() : 0L,
                result.getTotalRevenue() != null ? result.getTotalRevenue().doubleValue() : 0.0,
                result.getTotalCustomers() != null ? result.getTotalCustomers() : 0L
        );
    }

    @Override
    public DashboardResponse getDashboard(StatisticsQuery query) {
        OverviewStatisticsResponse overview = getOverview(query);

        return new DashboardResponse(
                overview.getTotalOrders() != null ? overview.getTotalOrders() : 0L,
                BigDecimal.valueOf(overview.getTotalRevenue() != null ? overview.getTotalRevenue() : 0.0),
                overview.getTotalProductsSold() != null ? overview.getTotalProductsSold() : 0L,
                BigDecimal.ZERO,
                0L,
                0L
        );
    }

    @Override
    public DashboardCompareResponse getDashboardCompare(StatisticsQuery query) {
        CompareMetricResponse emptyMetric = new CompareMetricResponse(
                BigDecimal.ZERO,
                BigDecimal.ZERO,
                BigDecimal.ZERO,
                BigDecimal.ZERO
        );

        return new DashboardCompareResponse(
                emptyMetric,
                emptyMetric,
                emptyMetric,
                emptyMetric
        );
    }

    @Override
    public List<RevenueChartItemResponse> getRevenue(String groupBy, StatisticsQuery query) {
        String fromDate = query.getFrom() != null ? query.getFrom().toString() : null;
        String toDate = query.getTo() != null ? query.getTo().toString() : null;

        List<Object[]> rows;

        switch (groupBy == null ? "day" : groupBy.toLowerCase()) {
            case "week" -> rows = statisticsRepository.getRevenueByWeek(fromDate, toDate);
            case "month" -> rows = statisticsRepository.getRevenueByMonth(fromDate, toDate);
            default -> rows = statisticsRepository.getRevenueByDay(fromDate, toDate);
        }

        return rows.stream().map(row -> new RevenueChartItemResponse(
                row[0] != null ? row[0].toString() : "",
                row[1] != null ? ((Number) row[1]).longValue() : 0L,
                row[2] != null ? new BigDecimal(row[2].toString()) : BigDecimal.ZERO,
                row[3] != null ? ((Number) row[3]).longValue() : 0L,
                row[4] != null ? new BigDecimal(row[4].toString()) : BigDecimal.ZERO
        )).toList();
    }

    @Override
    public PageResponse<TopProductResponse> getTopProducts(StatisticsQuery query, int page, int size) {
        Page<TopProductResponse> pageData = statisticsRepository.getTopProducts(
                query.getFrom() != null ? query.getFrom().toString() : null,
                query.getTo() != null ? query.getTo().toString() : null,
                PageRequest.of(page, size)
        );

        PageResponse<TopProductResponse> response = new PageResponse<>();
        response.setContent(pageData.getContent());
        response.setPage(pageData.getNumber());
        response.setSize(pageData.getSize());
        response.setTotalElements(pageData.getTotalElements());
        response.setTotalPages(pageData.getTotalPages());

        return response;
    }

    @Override
    public List<LowStockResponse> getLowStockProducts(Integer threshold) {
        return Collections.emptyList();
    }

    @Override
    public PageResponse<TopCustomerResponse> getTopCustomers(StatisticsQuery query, int page, int size) {
        return new PageResponse<>();
    }

    @Override
    public PageResponse<TopEmployeeResponse> getTopEmployees(StatisticsQuery query, int page, int size) {
        return new PageResponse<>();
    }

    @Override
    public List<OrderStatusResponse> getOrderStatusStatistics(StatisticsQuery query) {
        return Collections.emptyList();
    }

    @Override
    public PageResponse<TopRatedProductResponse> getTopRatedProducts(StatisticsQuery query, int page, int size) {
        return new PageResponse<>();
    }

    private Long toLong(Object value) {
        if (value == null) return 0L;
        if (value instanceof Number number) {
            return number.longValue();
        }
        return Long.parseLong(value.toString());
    }

    private Double toDouble(Object value) {
        if (value == null) return 0.0;
        if (value instanceof Number number) {
            return number.doubleValue();
        }
        return Double.parseDouble(value.toString());
    }
}