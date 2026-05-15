package com.vn.backend.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class ReviewItemResponse {

    private Long reviewId;
    private Long productId;
    private String productName;
    private Long userId;
    private String fullName;
    private Integer rating;
    private String comment;
    private Boolean status;
    private LocalDateTime createdAt;
}
