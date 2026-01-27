package com.vn.backend.service;

import com.vn.backend.dto.response.AttributeResponse;

import java.util.List;

public interface AttributeService {
    List<AttributeResponse> getAttributesForVariant();
}