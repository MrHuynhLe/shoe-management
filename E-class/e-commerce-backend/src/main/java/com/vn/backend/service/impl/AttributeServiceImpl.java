package com.vn.backend.service.impl;

import com.vn.backend.dto.request.AttributeRequest;
import com.vn.backend.dto.request.AttributeValueRequest;
import com.vn.backend.dto.response.AttributeResponse;
import com.vn.backend.entity.Attribute;
import com.vn.backend.entity.AttributeValue;
import com.vn.backend.repository.AttributeRepository;
import com.vn.backend.repository.AttributeValueRepository;
import com.vn.backend.service.AttributeService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AttributeServiceImpl implements AttributeService {

    private final AttributeRepository attributeRepository;
    private final AttributeValueRepository valueRepository;

    private AttributeResponse mapToResponse(Attribute attr) {
        AttributeResponse res = new AttributeResponse();
        res.setId(attr.getId());
        res.setCode(attr.getCode());
        res.setName(attr.getName());
        if (attr.getValues() != null) {
            List<AttributeResponse.ValueItem> items = attr.getValues().stream().map(v -> {
                AttributeResponse.ValueItem item = new AttributeResponse.ValueItem();
                item.setId(v.getId());
                item.setValue(v.getValue());
                return item;
            }).collect(Collectors.toList());
            res.setValues(items);
        }
        return res;
    }

    @Override
    public List<AttributeResponse> getAllAttributes() {
        return attributeRepository.findAll().stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }

    @Override
    public AttributeResponse getAttributeById(Long id) {
        Attribute attr = attributeRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy attribute id: " + id));
        return mapToResponse(attr);
    }

    @Override
    public AttributeResponse getAttributeByCode(String code) {
        Attribute attr = attributeRepository.findByCode(code)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy attribute code: " + code));
        return mapToResponse(attr);
    }

    @Override
    public List<AttributeResponse> searchAttributes(String name) {
        return attributeRepository.findByNameContainingIgnoreCase(name).stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }

    @Override
    public AttributeResponse createAttribute(AttributeRequest request) {
        if (attributeRepository.existsByCode(request.getCode())) {
            throw new RuntimeException("Code đã tồn tại: " + request.getCode());
        }
        Attribute attr = new Attribute();
        attr.setCode(request.getCode());
        attr.setName(request.getName());
        return mapToResponse(attributeRepository.save(attr));
    }

    @Override
    public AttributeResponse updateAttribute(Long id, AttributeRequest request) {
        Attribute attr = attributeRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy attribute id: " + id));
        if (request.getCode() != null && !request.getCode().equals(attr.getCode())) {
            if (attributeRepository.existsByCode(request.getCode())) {
                throw new RuntimeException("Code đã tồn tại: " + request.getCode());
            }
            attr.setCode(request.getCode());
        }
        if (request.getName() != null) attr.setName(request.getName());
        return mapToResponse(attributeRepository.save(attr));
    }

    @Override
    public void deleteAttribute(Long id) {
        if (!attributeRepository.existsById(id)) {
            throw new RuntimeException("Không tìm thấy attribute id: " + id);
        }
        attributeRepository.deleteById(id);
    }

    @Override
    public AttributeResponse addValue(Long attributeId, AttributeValueRequest request) {
        Attribute attr = attributeRepository.findById(attributeId)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy attribute id: " + attributeId));
        if (valueRepository.existsByAttributeIdAndValue(attributeId, request.getValue())) {
            throw new RuntimeException("Giá trị '" + request.getValue() + "' đã tồn tại trong attribute này");
        }
        AttributeValue av = new AttributeValue();
        av.setAttribute(attr);
        av.setValue(request.getValue());
        valueRepository.save(av);
        // Reload để có values list đầy đủ
        Attribute updated = attributeRepository.findById(attributeId).orElseThrow();
        return mapToResponse(updated);
    }

    @Override
    public AttributeResponse removeValue(Long attributeId, Long valueId) {
        AttributeValue av = valueRepository.findById(valueId)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy AttributeValue id: " + valueId));
        if (!av.getAttribute().getId().equals(attributeId)) {
            throw new RuntimeException("Value không thuộc attribute này");
        }
        valueRepository.deleteById(valueId);
        Attribute updated = attributeRepository.findById(attributeId).orElseThrow();
        return mapToResponse(updated);
    }
}
