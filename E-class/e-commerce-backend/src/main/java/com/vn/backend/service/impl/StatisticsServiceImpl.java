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
                getFromDate(query),
                getToDate(query),
                getOrderType(query)
        );

        if (result == null) {
            return new OverviewStatisticsResponse(0L, 0L, 0.0, 0.0, 0L);
        }

        return new OverviewStatisticsResponse(
                result.getTotalOrders() != null ? result.getTotalOrders() : 0L,
                result.getTotalProductsSold() != null ? result.getTotalProductsSold() : 0L,
                result.getTotalRevenue() != null ? result.getTotalRevenue().doubleValue() : 0.0,
                result.getTotalProfit() != null ? result.getTotalProfit().doubleValue() : 0.0,
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
                BigDecimal.valueOf(overview.getTotalProfit() != null ? overview.getTotalProfit() : 0.0),
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
        String fromDate = getFromDate(query);
        String toDate = getToDate(query);
        String orderType = getOrderType(query);

        List<Object[]> rows;

        switch (groupBy == null ? "day" : groupBy.toLowerCase()) {
            case "week" -> rows = statisticsRepository.getRevenueByWeek(fromDate, toDate, orderType);
            case "month" -> rows = statisticsRepository.getRevenueByMonth(fromDate, toDate, orderType);
            default -> rows = statisticsRepository.getRevenueByDay(fromDate, toDate, orderType);
        }

        return rows.stream()
                .map(row -> new RevenueChartItemResponse(
                        row[0] != null ? row[0].toString() : "",
                        toLong(row[1]),
                        toBigDecimal(row[2]),
                        toLong(row[3]),
                        toBigDecimal(row[4])
                ))
                .toList();
    }

    @Override
    public PageResponse<TopProductResponse> getTopProducts(StatisticsQuery query, int page, int size) {
        Page<TopProductResponse> pageData = statisticsRepository.getTopProducts(
                getFromDate(query),
                getToDate(query),
                getOrderType(query),
                PageRequest.of(Math.max(page, 0), Math.max(size, 1))
        );

        PageResponse<TopProductResponse> response = new PageResponse<>();
        response.setContent(pageData.getContent());
        response.setPage(pageData.getNumber());
        response.setSize(pageData.getSize());
        response.setTotalElements(pageData.getTotalElements());
        response.setTotalPages(pageData.getTotalPages());
        response.setLast(pageData.isLast());

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
        return statisticsRepository.getOrderStatusStatistics(
                        getFromDate(query),
                        getToDate(query),
                        getOrderType(query)
                )
                .stream()
                .map(row -> new OrderStatusResponse(
                        row[0] != null ? row[0].toString() : "UNKNOWN",
                        toLong(row[1]),
                        toBigDecimal(row[2])
                ))
                .toList();
    }

    @Override
    public PageResponse<TopRatedProductResponse> getTopRatedProducts(StatisticsQuery query, int page, int size) {
        return new PageResponse<>();
    }

    @Override
    public List<PaymentMethodRevenueResponse> getRevenueByPaymentMethod(StatisticsQuery query) {
        return statisticsRepository.getRevenueByPaymentMethod(
                        getFromDate(query),
                        getToDate(query),
                        getOrderType(query)
                )
                .stream()
                .map(row -> new PaymentMethodRevenueResponse(
                        row[0] != null ? row[0].toString() : "UNKNOWN",
                        row[1] != null ? row[1].toString() : "Khác",
                        toLong(row[2]),
                        toBigDecimal(row[3])
                ))
                .toList();
    }

    private String getFromDate(StatisticsQuery query) {
        return query != null && query.getFrom() != null
                ? query.getFrom().toString()
                : null;
    }

    private String getToDate(StatisticsQuery query) {
        return query != null && query.getTo() != null
                ? query.getTo().toString()
                : null;
    }

    private String getOrderType(StatisticsQuery query) {
        if (query == null || query.getOrderType() == null || query.getOrderType().isBlank()) {
            return "ALL";
        }

        String orderType = query.getOrderType().trim().toUpperCase();

        if (!orderType.equals("ALL") && !orderType.equals("POS") && !orderType.equals("ONLINE")) {
            return "ALL";
        }

        return orderType;
    }

    private Long toLong(Object value) {
        if (value == null) {
            return 0L;
        }

        if (value instanceof Number number) {
            return number.longValue();
        }

        return Long.parseLong(value.toString());
    }

    private BigDecimal toBigDecimal(Object value) {
        if (value == null) {
            return BigDecimal.ZERO;
        }

        if (value instanceof BigDecimal bigDecimal) {
            return bigDecimal;
        }

        if (value instanceof Number number) {
            return BigDecimal.valueOf(number.doubleValue());
        }

        return new BigDecimal(value.toString());
    }
}