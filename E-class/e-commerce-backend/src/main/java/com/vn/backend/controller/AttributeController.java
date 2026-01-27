package com.vn.backend.controller;

import com.vn.backend.dto.response.AttributeResponse;
import com.vn.backend.service.AttributeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/v1/attributes")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
@Validated
public class AttributeController {

    private final AttributeService attributeService;

    @GetMapping("")
    public ResponseEntity<List<AttributeResponse>> getVariantOptions() {
        List<AttributeResponse> data = attributeService.getAttributesForVariant();

        data.forEach(attr -> {
            if (attr.getValues() == null || attr.getValues().isEmpty()) {

                System.out.println("Warning: Attribute " + attr.getName() + " hasn't any values.");
            }
        });

        return ResponseEntity.ok(data);
    }
}