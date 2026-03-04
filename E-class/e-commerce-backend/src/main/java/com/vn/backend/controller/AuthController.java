package com.vn.backend.controller;

import com.vn.backend.dto.request.LoginRequest;
import com.vn.backend.dto.response.LoginResponse;
import com.vn.backend.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/v1/auth")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(
            @RequestBody LoginRequest request) {

        return ResponseEntity.ok(authService.login(request));
    }
}
