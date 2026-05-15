package com.vn.backend.dto.response;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class RatingDistributionResponse {

    private Long oneStar;
    private Long twoStar;
    private Long threeStar;
    private Long fourStar;
    private Long fiveStar;
}
