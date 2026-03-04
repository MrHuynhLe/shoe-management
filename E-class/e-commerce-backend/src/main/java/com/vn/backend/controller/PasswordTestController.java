package com.vn.backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/v1/test")
@RequiredArgsConstructor
public class PasswordTestController {

    private final PasswordEncoder passwordEncoder;

    @GetMapping("/bcrypt")
    public String bcrypt(@RequestParam String raw) {
        return passwordEncoder.encode(raw);
    }
}