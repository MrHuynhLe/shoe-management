package com.vn.backend.service;

import com.vn.backend.dto.request.AttributeRequest;
import com.vn.backend.dto.request.AttributeValueRequest;
import com.vn.backend.dto.response.AttributeResponse;

import java.util.List;

public interface AttributeService {
    List<AttributeResponse> getAllAttributes();
    AttributeResponse getAttributeById(Long id);
    AttributeResponse getAttributeByCode(String code);
    List<AttributeResponse> searchAttributes(String name);
    AttributeResponse createAttribute(AttributeRequest request);
    AttributeResponse updateAttribute(Long id, AttributeRequest request);
    void deleteAttribute(Long id);
    AttributeResponse addValue(Long attributeId, AttributeValueRequest request);
    AttributeResponse removeValue(Long attributeId, Long valueId);
}