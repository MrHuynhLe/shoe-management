package com.vn.backend.dto.response;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter @Setter
public class AttributeResponse {
    private Long id;
    private String code;
    private String name;
    private List<ValueItem> values;

    @Getter @Setter
    public static class ValueItem {
        private Long id;
        private String value;
    }
}
