package com.vn.backend.controller;

import com.vn.backend.dto.request.StatisticsQuery;
import com.vn.backend.dto.response.PageResponse;
import com.vn.backend.dto.response.statistics.*;
import com.vn.backend.service.StatisticsExportService;
import com.vn.backend.service.StatisticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/v1/statistics")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class StatisticsController {

    private final StatisticsService statisticsService;
    private final StatisticsExportService statisticsExportService;

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardResponse> getDashboard(StatisticsQuery query) {
        return ResponseEntity.ok(statisticsService.getDashboard(query));
    }

    @GetMapping("/overview")
    public ResponseEntity<OverviewStatisticsResponse> getOverview(
            @ModelAttribute StatisticsQuery query
    ) {
        return ResponseEntity.ok(statisticsService.getOverview(query));
    }
    @GetMapping("/dashboard-compare")
    public ResponseEntity<DashboardCompareResponse> getDashboardCompare(StatisticsQuery query) {
        return ResponseEntity.ok(statisticsService.getDashboardCompare(query));
    }

    @GetMapping("/revenue")
    public ResponseEntity<List<RevenueChartItemResponse>> getRevenue(
            @RequestParam(defaultValue = "day") String groupBy,
            StatisticsQuery query
    ) {
        return ResponseEntity.ok(statisticsService.getRevenue(groupBy, query));
    }

    @GetMapping("/top-products")
    public ResponseEntity<PageResponse<TopProductResponse>> getTopProducts(
            StatisticsQuery query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(statisticsService.getTopProducts(query, page, size));
    }

    @GetMapping("/inventory/low-stock")
    public ResponseEntity<List<LowStockResponse>> getLowStockProducts(
            @RequestParam(required = false) Integer threshold
    ) {
        return ResponseEntity.ok(statisticsService.getLowStockProducts(threshold));
    }

    @GetMapping("/top-customers")
    public ResponseEntity<PageResponse<TopCustomerResponse>> getTopCustomers(
            StatisticsQuery query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(statisticsService.getTopCustomers(query, page, size));
    }

    @GetMapping("/top-employees")
    public ResponseEntity<PageResponse<TopEmployeeResponse>> getTopEmployees(
            StatisticsQuery query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(statisticsService.getTopEmployees(query, page, size));
    }

    @GetMapping("/order-status")
    public ResponseEntity<List<OrderStatusResponse>> getOrderStatusStatistics(StatisticsQuery query) {
        return ResponseEntity.ok(statisticsService.getOrderStatusStatistics(query));
    }

    @GetMapping("/top-rated-products")
    public ResponseEntity<PageResponse<TopRatedProductResponse>> getTopRatedProducts(
            StatisticsQuery query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(statisticsService.getTopRatedProducts(query, page, size));
    }

    @GetMapping("/export/excel/top-products")
    public ResponseEntity<byte[]> exportTopProductsExcel(
            StatisticsQuery query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "100") int size
    ) {
        byte[] bytes = statisticsExportService.exportTopProductsExcel(query, page, size);

        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=top-products.xlsx")
                .header("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
                .body(bytes);
    }

    @GetMapping("/export/pdf/top-products")
    public ResponseEntity<byte[]> exportTopProductsPdf(
            StatisticsQuery query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "100") int size
    ) {
        byte[] bytes = statisticsExportService.exportTopProductsPdf(query, page, size);

        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=top-products.pdf")
                .header("Content-Type", "application/pdf")
                .body(bytes);
    }

    @GetMapping("/export/excel/top-customers")
    public ResponseEntity<byte[]> exportTopCustomersExcel(
            StatisticsQuery query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "100") int size
    ) {
        byte[] bytes = statisticsExportService.exportTopCustomersExcel(query, page, size);

        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=top-customers.xlsx")
                .header("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
                .body(bytes);
    }

    @GetMapping("/export/pdf/top-customers")
    public ResponseEntity<byte[]> exportTopCustomersPdf(
            StatisticsQuery query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "100") int size
    ) {
        byte[] bytes = statisticsExportService.exportTopCustomersPdf(query, page, size);

        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=top-customers.pdf")
                .header("Content-Type", "application/pdf")
                .body(bytes);
    }

    @GetMapping("/export/excel/top-employees")
    public ResponseEntity<byte[]> exportTopEmployeesExcel(
            StatisticsQuery query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "100") int size
    ) {
        byte[] bytes = statisticsExportService.exportTopEmployeesExcel(query, page, size);

        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=top-employees.xlsx")
                .header("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
                .body(bytes);
    }

    @GetMapping("/export/pdf/top-employees")
    public ResponseEntity<byte[]> exportTopEmployeesPdf(
            StatisticsQuery query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "100") int size
    ) {
        byte[] bytes = statisticsExportService.exportTopEmployeesPdf(query, page, size);

        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=top-employees.pdf")
                .header("Content-Type", "application/pdf")
                .body(bytes);
    }

    @GetMapping("/export/excel/order-status")
    public ResponseEntity<byte[]> exportOrderStatusExcel(StatisticsQuery query) {
        byte[] bytes = statisticsExportService.exportOrderStatusExcel(query);

        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=order-status.xlsx")
                .header("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
                .body(bytes);
    }

    @GetMapping("/export/pdf/order-status")
    public ResponseEntity<byte[]> exportOrderStatusPdf(StatisticsQuery query) {
        byte[] bytes = statisticsExportService.exportOrderStatusPdf(query);

        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=order-status.pdf")
                .header("Content-Type", "application/pdf")
                .body(bytes);
    }

    @GetMapping("/export/pdf/dashboard")
    public ResponseEntity<byte[]> exportDashboardPdf(StatisticsQuery query) {
        byte[] bytes = statisticsExportService.exportDashboardPdf(query);

        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=dashboard-report.pdf")
                .header("Content-Type", "application/pdf")
                .body(bytes);
    }

    @GetMapping("/payment-methods")
    public ResponseEntity<List<PaymentMethodRevenueResponse>> getRevenueByPaymentMethod(StatisticsQuery query) {
        return ResponseEntity.ok(statisticsService.getRevenueByPaymentMethod(query));
    }
}