package com.vn.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class ShoeApplication {

    public static void main(String[] args) {
        SpringApplication.run(ShoeApplication.class, args);
    }

}
