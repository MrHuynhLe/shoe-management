package com.vn.backend.controller;

import com.vn.backend.dto.request.AttributeValueRequest;
import com.vn.backend.dto.response.AttributeValueResponse;
import com.vn.backend.service.AttributeValueService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/v1")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class AttributeValueController {

    private final AttributeValueService service;

    // ✅ SIZE: GET /api/v1/attributes/SIZE/values
    @GetMapping("/attributes/{code}/values")
    public ResponseEntity<List<AttributeValueResponse>> getValues(@PathVariable String code) {
        return ResponseEntity.ok(service.getByCode(code));
    }

    // ✅ SIZE: POST /api/v1/attributes/SIZE/values  body { "value": "43" }
    @PostMapping("/attributes/{code}/values")
    public ResponseEntity<AttributeValueResponse> create(
            @PathVariable String code,
            @Valid @RequestBody AttributeValueRequest req
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.createByCode(code, req));
    }

    // PUT /api/v1/attribute-values/{id}
    @PutMapping("/attribute-values/{id}")
    public ResponseEntity<AttributeValueResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody AttributeValueRequest req
    ) {
        return ResponseEntity.ok(service.update(id, req));
    }

    // DELETE /api/v1/attribute-values/{id}
    @DeleteMapping("/attribute-values/{id}")
    public ResponseEntity<Void> disable(@PathVariable Long id) {
        service.disable(id);
        return ResponseEntity.noContent().build();
    }
}