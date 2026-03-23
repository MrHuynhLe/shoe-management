package com.vn.backend.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class FileStorageService {

    private final Path uploadRoot = Paths.get("uploads").toAbsolutePath().normalize();
    private final Path productDir = uploadRoot.resolve("products");

    public String store(MultipartFile file) {
        try {
            if (file == null || file.isEmpty()) {
                throw new RuntimeException("File rỗng");
            }

            if (!Files.exists(productDir)) {
                Files.createDirectories(productDir);
            }

            String originalName = file.getOriginalFilename();
            String extension = "";

            if (originalName != null && originalName.contains(".")) {
                extension = originalName.substring(originalName.lastIndexOf("."));
            }

            String filename = UUID.randomUUID() + extension;
            Path target = productDir.resolve(filename);

            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);

            System.out.println("UPLOAD ROOT = " + uploadRoot);
            System.out.println("PRODUCT DIR = " + productDir);
            System.out.println("SAVED FILE = " + target);

            return "/uploads/products/" + filename;
        } catch (Exception e) {
            throw new RuntimeException("Upload ảnh thất bại", e);
        }
    }
}