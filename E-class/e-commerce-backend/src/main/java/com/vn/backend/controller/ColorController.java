package com.vn.backend.controller;

import com.vn.backend.dto.request.ColorRequest;
import com.vn.backend.dto.response.ColorResponse;
import com.vn.backend.service.ColorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/v1/colors")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class ColorController {

    private final ColorService colorService;

   
    @GetMapping
    public ResponseEntity<List<ColorResponse>> getAll() {
        return ResponseEntity.ok(colorService.getAll());
    }

   
    @PostMapping
    public ResponseEntity<ColorResponse> create(@Valid @RequestBody ColorRequest request) {
        ColorResponse created = colorService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ColorResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody ColorRequest request
    ) {
        return ResponseEntity.ok(colorService.update(id, request));
    }


    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        colorService.delete(id);
        return ResponseEntity.noContent().build();
    }
}