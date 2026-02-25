package com.vn.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(scanBasePackages = "com.vn.backend")
public class ShoeApplication {
    public static void main(String[] args) {
        SpringApplication.run(ShoeApplication.class, args);
    }
}