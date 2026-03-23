package com.vn.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        Path uploadRoot = Paths.get("uploads").toAbsolutePath().normalize();

        String uploadLocation = uploadRoot.toUri().toString();

        System.out.println("RESOURCE UPLOAD ROOT = " + uploadRoot);
        System.out.println("RESOURCE LOCATION = " + uploadLocation);

        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(uploadLocation);
    }

    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}