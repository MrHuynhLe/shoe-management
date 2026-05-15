package com.vn.backend.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class ProductReviewResponse {

    private Double avgRating;
    private Long totalReviews;
    private RatingDistributionResponse ratingDistribution;
    private List<ReviewItemResponse> items;
}
