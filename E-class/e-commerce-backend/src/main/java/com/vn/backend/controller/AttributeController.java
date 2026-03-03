package com.vn.backend.controller;

import com.vn.backend.dto.request.AttributeRequest;
import com.vn.backend.dto.request.AttributeValueRequest;
import com.vn.backend.dto.response.AttributeResponse;
import com.vn.backend.service.AttributeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/attributes")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class AttributeController {

    private final AttributeService attributeService;

    // GET /attributes
    @GetMapping
    public ResponseEntity<List<AttributeResponse>> getAll() {
        return ResponseEntity.ok(attributeService.getAllAttributes());
    }

    // GET /attributes/{id}
    @GetMapping("/{id}")
    public ResponseEntity<AttributeResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(attributeService.getAttributeById(id));
    }

    // GET /attributes/code/{code}
    @GetMapping("/code/{code}")
    public ResponseEntity<AttributeResponse> getByCode(@PathVariable String code) {
        return ResponseEntity.ok(attributeService.getAttributeByCode(code));
    }

    // GET /attributes/search?name=...
    @GetMapping("/search")
    public ResponseEntity<List<AttributeResponse>> search(@RequestParam String name) {
        return ResponseEntity.ok(attributeService.searchAttributes(name));
    }

    // POST /attributes
    @PostMapping
    public ResponseEntity<AttributeResponse> create(@RequestBody AttributeRequest request) {
        return ResponseEntity.ok(attributeService.createAttribute(request));
    }

    // PUT /attributes/{id}
    @PutMapping("/{id}")
    public ResponseEntity<AttributeResponse> update(@PathVariable Long id,
                                                    @RequestBody AttributeRequest request) {
        return ResponseEntity.ok(attributeService.updateAttribute(id, request));
    }

    // DELETE /attributes/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        attributeService.deleteAttribute(id);
        return ResponseEntity.noContent().build();
    }

    // POST /attributes/{id}/values — thêm giá trị (VD: Size: 39, 40, 41; Color: Đỏ, Xanh)
    @PostMapping("/{id}/values")
    public ResponseEntity<AttributeResponse> addValue(@PathVariable Long id,
                                                      @RequestBody AttributeValueRequest request) {
        return ResponseEntity.ok(attributeService.addValue(id, request));
    }

    // DELETE /attributes/{id}/values/{valueId} — xóa giá trị
    @DeleteMapping("/{id}/values/{valueId}")
    public ResponseEntity<AttributeResponse> removeValue(@PathVariable Long id,
                                                         @PathVariable Long valueId) {
        return ResponseEntity.ok(attributeService.removeValue(id, valueId));
    }
}
