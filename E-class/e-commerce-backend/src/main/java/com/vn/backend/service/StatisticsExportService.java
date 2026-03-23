package com.vn.backend.service;

import com.vn.backend.dto.request.StatisticsQuery;

public interface StatisticsExportService {

    byte[] exportTopProductsExcel(StatisticsQuery query, int page, int size);
    byte[] exportTopProductsPdf(StatisticsQuery query, int page, int size);

    byte[] exportTopCustomersExcel(StatisticsQuery query, int page, int size);
    byte[] exportTopCustomersPdf(StatisticsQuery query, int page, int size);

    byte[] exportTopEmployeesExcel(StatisticsQuery query, int page, int size);
    byte[] exportTopEmployeesPdf(StatisticsQuery query, int page, int size);

    byte[] exportOrderStatusExcel(StatisticsQuery query);
    byte[] exportOrderStatusPdf(StatisticsQuery query);

    byte[] exportDashboardPdf(StatisticsQuery query);
}