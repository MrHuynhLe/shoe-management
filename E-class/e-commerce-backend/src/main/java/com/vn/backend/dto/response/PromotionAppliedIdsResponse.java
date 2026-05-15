package com.vn.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PromotionAppliedIdsResponse {
    private List<Long> productIds;
    private List<Long> variantIds;
}
