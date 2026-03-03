package com.vn.backend.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;

@Service
public class FileStorageService {

    private final Path root = Paths.get("uploads/products");

    public String store(MultipartFile file) {
        try {
            if (!Files.exists(root)) {
                Files.createDirectories(root);
            }

            String filename = System.currentTimeMillis() + "_" + file.getOriginalFilename();
            Path target = root.resolve(filename);

            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);

            return "/uploads/products/" + filename;
        } catch (Exception e) {
            throw new RuntimeException("Upload ảnh thất bại");
        }
    }
}
