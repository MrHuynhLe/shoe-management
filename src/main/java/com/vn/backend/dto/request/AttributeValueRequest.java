package com.vn.backend.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class AttributeValueRequest {
    private Long attributeId;
    private String value;
}
