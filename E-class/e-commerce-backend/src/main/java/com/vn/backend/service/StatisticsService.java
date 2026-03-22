package com.vn.backend.service;

import com.vn.backend.dto.request.StatisticsQuery;
import com.vn.backend.dto.response.PageResponse;
import com.vn.backend.dto.response.statistics.*;

import java.util.List;

public interface StatisticsService {

    OverviewStatisticsResponse getOverview(StatisticsQuery query);


    DashboardResponse getDashboard(StatisticsQuery query);

    DashboardCompareResponse getDashboardCompare(StatisticsQuery query);

    List<RevenueChartItemResponse> getRevenue(String groupBy, StatisticsQuery query);

    PageResponse<TopProductResponse> getTopProducts(StatisticsQuery query, int page, int size);

    List<LowStockResponse> getLowStockProducts(Integer threshold);

    PageResponse<TopCustomerResponse> getTopCustomers(StatisticsQuery query, int page, int size);

    PageResponse<TopEmployeeResponse> getTopEmployees(StatisticsQuery query, int page, int size);

    List<OrderStatusResponse> getOrderStatusStatistics(StatisticsQuery query);

    PageResponse<TopRatedProductResponse> getTopRatedProducts(StatisticsQuery query, int page, int size);
}