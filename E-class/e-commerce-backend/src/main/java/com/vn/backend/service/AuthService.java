package com.vn.backend.service;

import com.vn.backend.security.JwtUtil;
import com.vn.backend.dto.request.LoginRequest;
import com.vn.backend.dto.response.LoginResponse;
import com.vn.backend.entity.User;
import com.vn.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public LoginResponse login(LoginRequest request) {

        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("Username not found"));

        if (Boolean.FALSE.equals(user.getIsActive())) {
            throw new RuntimeException("Account is disabled");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Wrong password");
        }

        String roleCode = user.getRole().getCode();

        String token = jwtUtil.generateToken(user.getUsername(), roleCode);
        System.out.println(passwordEncoder.encode("123456"));
        return new LoginResponse(
                token,
                user.getId(),
                user.getUsername(),
                roleCode
        );

    }
}
