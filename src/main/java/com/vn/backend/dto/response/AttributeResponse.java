package com.vn.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
public class AttributeResponse {
    private Long id;
    private String name;
    private String code;
    private List<AttributeValueResponse> values;

    @Data
    @AllArgsConstructor
    public static class AttributeValueResponse {
        private Long id;
        private String value;
    }
}
