package com.vn.backend.service.impl;

import com.vn.backend.dto.request.ColorRequest;
import com.vn.backend.dto.response.ColorResponse;
import com.vn.backend.entity.Attribute;
import com.vn.backend.entity.AttributeValue;
import com.vn.backend.repository.AttributeRepository;
import com.vn.backend.repository.AttributeValueRepository;
import com.vn.backend.service.ColorService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ColorServiceImpl implements ColorService {

    private static final String COLOR_CODE = "COLOR";

    private final AttributeRepository attributeRepository;
    private final AttributeValueRepository attributeValueRepository;

    private Attribute getColorAttribute() {
        return attributeRepository.findByCodeIgnoreCase(COLOR_CODE)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy attribute COLOR"));
    }

    @Override
    public List<ColorResponse> getAll() {
        Attribute colorAttr = getColorAttribute();

        return attributeValueRepository.findByAttribute_IdOrderByIdDesc(colorAttr.getId())
                .stream()
                .map(v -> new ColorResponse(v.getId(), v.getValue()))
                .toList();
    }

    @Override
    @Transactional
    public ColorResponse create(ColorRequest request) {
        Attribute colorAttr = getColorAttribute();
        String value = request.getValue().trim();

        if (attributeValueRepository.existsByAttribute_IdAndValueIgnoreCase(colorAttr.getId(), value)) {
            throw new RuntimeException("Màu đã tồn tại");
        }

        AttributeValue v = new AttributeValue();
        v.setAttribute(colorAttr);
        v.setValue(value);

        AttributeValue saved = attributeValueRepository.save(v);
        return new ColorResponse(saved.getId(), saved.getValue());
    }

    @Override
    @Transactional
    public ColorResponse update(Long id, ColorRequest request) {
        Attribute colorAttr = getColorAttribute();

        AttributeValue v = attributeValueRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Màu không tồn tại: " + id));

        // đảm bảo id này đúng là COLOR
        if (!v.getAttribute().getId().equals(colorAttr.getId())) {
            throw new RuntimeException("Giá trị này không thuộc COLOR");
        }

        String newValue = request.getValue().trim();

        if (attributeValueRepository.existsByAttribute_IdAndValueIgnoreCase(colorAttr.getId(), newValue)) {
            throw new RuntimeException("Màu đã tồn tại");
        }

        v.setValue(newValue);
        AttributeValue saved = attributeValueRepository.save(v);
        return new ColorResponse(saved.getId(), saved.getValue());
    }

    @Override
    @Transactional
    public void delete(Long id) {
        Attribute colorAttr = getColorAttribute();

        AttributeValue v = attributeValueRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Màu không tồn tại: " + id));

        if (!v.getAttribute().getId().equals(colorAttr.getId())) {
            throw new RuntimeException("Giá trị này không thuộc COLOR");
        }
        attributeValueRepository.delete(v);
    }
}