package com.vn.backend.service.impl;

import com.vn.backend.dto.request.AttributeValueRequest;
import com.vn.backend.dto.response.AttributeValueResponse;
import com.vn.backend.entity.Attribute;
import com.vn.backend.entity.AttributeValue;
import com.vn.backend.repository.AttributeRepository;
import com.vn.backend.repository.AttributeValueRepository;
import com.vn.backend.service.AttributeValueService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AttributeValueServiceImpl implements AttributeValueService {

    private final AttributeRepository attributeRepository;
    private final AttributeValueRepository attributeValueRepository;

    @Override
    @Transactional
    public List<AttributeValueResponse> getByCode(String code) {
        return attributeValueRepository.findActiveByAttributeCode(code)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public AttributeValueResponse createByCode(String code, AttributeValueRequest req) {
        String value = normalize(req.getValue());

        Attribute attribute = attributeRepository.findByCode(code.toUpperCase())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy attribute code=" + code));

        if (attributeValueRepository.existsByAttribute_IdAndValueIgnoreCase(attribute.getId(), value)) {
            throw new RuntimeException("Giá trị đã tồn tại trong " + code);
        }

        AttributeValue saved = attributeValueRepository.save(
                AttributeValue.builder()
                        .attribute(attribute)
                        .value(value)
                        .isActive(true) // ✅ bắt buộc để khỏi NULL
                        .build()
        );

        return toResponse(saved);
    }

    @Override
    @Transactional
    public AttributeValueResponse update(Long id, AttributeValueRequest req) {
        String value = normalize(req.getValue());

        AttributeValue av = attributeValueRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy id=" + id));

        // check trùng trong cùng attribute
        if (attributeValueRepository.existsByAttribute_IdAndValueIgnoreCase(av.getAttribute().getId(), value)
                && !av.getValue().equalsIgnoreCase(value)) {
            throw new RuntimeException("Giá trị đã tồn tại");
        }

        av.setValue(value);
        return toResponse(attributeValueRepository.save(av));
    }

    @Override
    @Transactional
    public void disable(Long id) {
        AttributeValue av = attributeValueRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy id=" + id));

        av.setIsActive(false);
        attributeValueRepository.save(av);
    }

    private AttributeValueResponse toResponse(AttributeValue av) {
        return AttributeValueResponse.builder()
                .id(av.getId())
                .value(av.getValue())
                .build();
    }

    private String normalize(String s) {
        if (s == null) return "";
        return s.trim();
    }
}