package com.vn.backend.controller;

import com.vn.backend.dto.request.ProfileUpdateRequest;
import com.vn.backend.dto.response.ProfileResponse;
import com.vn.backend.entity.User;
import com.vn.backend.entity.UserProfile;
import com.vn.backend.repository.UserProfileRepository;
import com.vn.backend.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/v1/profile")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class ProfileController {

    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;

    @GetMapping("/me")
    public ResponseEntity<ProfileResponse> getMyProfile() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy người dùng với username: " + username));

        UserProfile profile = user.getUserProfile();

        ProfileResponse response = new ProfileResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                profile.getFullName(),
                profile.getPhone(),
                profile.getAddress(),
                profile.getBirthday(),
                user.getRole().getName()
        );

        return ResponseEntity.ok(response);
    }

    @PutMapping("/me")
    public ResponseEntity<String> updateMyProfile(@Valid @RequestBody ProfileUpdateRequest request) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy người dùng với username: " + username));

        UserProfile profile = user.getUserProfile();
        profile.setFullName(request.getFullName());
        profile.setPhone(request.getPhone());
        profile.setAddress(request.getAddress());
        profile.setBirthday(request.getBirthday());

        userProfileRepository.save(profile);

        return ResponseEntity.ok("Cập nhật thông tin cá nhân thành công.");
    }
}