package com.vn.backend.service.impl;

import com.vn.backend.dto.response.AttributeResponse;
import com.vn.backend.entity.Attribute;
import com.vn.backend.exception.ResourceNotFoundException;
import com.vn.backend.mapper.AttributeMapper;
import com.vn.backend.repository.AttributeRepository;
import com.vn.backend.service.AttributeService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AttributeServiceImpl implements AttributeService {
    private final AttributeRepository attributeRepository;
    private final AttributeMapper attributeMapper;

    @Override
    public List<AttributeResponse> getAttributesForVariant() {
        List<Attribute> attributes = attributeRepository.findAll();

        // Validate: Nếu DB chưa setup thuộc tính cơ bản
        if (attributes.isEmpty()) {
            throw new
                    ResourceNotFoundException("Chưa cấu hình các thuộc tính (Size, Color) trong hệ thống");
        }

        return attributes.stream()
                .map(attributeMapper::toResponse)
                .collect(Collectors.toList());
    }
}