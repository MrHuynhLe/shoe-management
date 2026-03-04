package com.vn.backend.controller;

import com.vn.backend.repository.PermissionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/v1/test")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class controllerTest {

    private final PermissionRepository permissionRepository;

    @GetMapping("/perms/{userId}")
    public List<String> test(@PathVariable Long userId) {
        return permissionRepository.findPermissionCodesByUserId(userId);
    }
}