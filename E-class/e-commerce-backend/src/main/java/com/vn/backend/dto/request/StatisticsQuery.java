package com.vn.backend.dto.request;

import lombok.Getter;
import lombok.Setter;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;

@Getter
@Setter
public class StatisticsQuery {

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate from;

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate to;

    private Integer brandId;
    private Integer categoryId;
    private Integer employeeId;
    private Integer customerId;
    private String status;

    /**
     * ALL = tất cả đơn hàng
     * POS = bán tại quầy
     * ONLINE = đơn online
     */
    private String orderType = "ALL";
}