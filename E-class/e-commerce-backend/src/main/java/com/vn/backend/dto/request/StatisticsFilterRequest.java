package com.vn.backend.dto.request;

import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;

public record StatisticsFilterRequest(
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
        LocalDate from,

        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
        LocalDate to
) {
}