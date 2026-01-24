package com.vn.backend.controller;
import com.vn.backend.entity.Origin;
import com.vn.backend.repository.OriginRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
@RestController
@RequestMapping("/v1/origins")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class OriginController {

    private final OriginRepository originRepository;

    @GetMapping
    public List<Origin> getAll() {
        return originRepository.findByDeletedAtIsNullAndIsActiveTrue();
    }

    @PostMapping
    public Origin create(@RequestBody @Valid Origin origin) {
        origin.setId(null);
        origin.setIsActive(true);
        return originRepository.save(origin);
    }


}
