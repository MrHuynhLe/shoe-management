package com.vn.backend.service;


import com.vn.backend.dto.request.AttributeValueRequest;
import com.vn.backend.dto.response.AttributeValueResponse;

import java.util.List;

public interface AttributeValueService {
    List<AttributeValueResponse> getByCode(String code);
    AttributeValueResponse createByCode(String code, AttributeValueRequest req);
    AttributeValueResponse update(Long id, AttributeValueRequest req);
    void disable(Long id);
}