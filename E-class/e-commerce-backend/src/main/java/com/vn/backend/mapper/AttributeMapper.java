package com.vn.backend.mapper;

import com.vn.backend.dto.response.AttributeResponse;
import com.vn.backend.entity.Attribute;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
public class AttributeMapper {
    public AttributeResponse toResponse(Attribute entity) {
        AttributeResponse response = new AttributeResponse();
        response.setId(entity.getId());
        response.setName(entity.getName());
        response.setCode(entity.getCode());

        if (entity.getAttributeValues() != null) {
            response.setValues(entity.getAttributeValues().stream()
                    .map(v -> new AttributeResponse.AttributeValueResponse(v.getId(), v.getValue()))
                    .collect(Collectors.toList()));
        }
        return response;
    }
}