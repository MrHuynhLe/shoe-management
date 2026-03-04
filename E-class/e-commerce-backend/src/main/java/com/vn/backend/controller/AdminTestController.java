package com.vn.backend.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin")
public class AdminTestController {

    @PreAuthorize("hasAuthority('PRODUCT_CREATE')")
    @GetMapping("/secure-test")
    public String test() {
        return "OK - You have PRODUCT_CREATE";
    }
}