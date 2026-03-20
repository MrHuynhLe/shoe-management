package com.vn.backend.service.impl;

import com.vn.backend.dto.response.AttributeResponse;
import com.vn.backend.entity.Attribute;
import com.vn.backend.entity.AttributeValue;
import com.vn.backend.repository.AttributeRepository;
import com.vn.backend.service.AttributeService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AttributeServiceImpl implements AttributeService {

    private final AttributeRepository attributeRepository;

    @Override
    public List<AttributeResponse> getAttributesForVariant() {
        List<Attribute> attributes = attributeRepository.findAll();

        return attributes.stream()
                .map(this::toResponse)
                .toList();
    }

    private AttributeResponse toResponse(Attribute attribute) {
        AttributeResponse response = new AttributeResponse();
        response.setId(attribute.getId());
        response.setCode(attribute.getCode());
        response.setName(attribute.getName());

        List<AttributeResponse.AttributeValueResponse> values =
                attribute.getAttributeValues() == null
                        ? List.of()
                        : attribute.getAttributeValues().stream()
                        .filter(item -> Boolean.TRUE.equals(item.getIsActive()))
                        .map(this::toValueResponse)
                        .toList();

        response.setValues(values);
        return response;
    }

    private AttributeResponse.AttributeValueResponse toValueResponse(AttributeValue value) {
        return new AttributeResponse.AttributeValueResponse(
                value.getId(),
                value.getValue()
        );
    }
}