package com.vn.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class OrderReturnReviewRequest {

    /**
     * APPROVE hoặc REJECT
     */
    @NotBlank(message = "Action không được để trống")
    private String action;

    /**
     * Ghi chú xử lý của admin
     */
    private String note;
}