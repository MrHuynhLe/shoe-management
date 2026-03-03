package com.vn.backend.service;

import com.vn.backend.dto.request.ColorRequest;
import com.vn.backend.dto.response.ColorResponse;

import java.util.List;

public interface ColorService {
    List<ColorResponse> getAll();
    ColorResponse create(ColorRequest request);
    ColorResponse update(Long id, ColorRequest request);
    void delete(Long id);
}