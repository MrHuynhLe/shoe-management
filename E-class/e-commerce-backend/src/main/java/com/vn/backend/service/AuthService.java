package com.vn.backend.service;

import com.vn.backend.common.AppException;
import com.vn.backend.dto.request.LoginRequest;
import com.vn.backend.dto.response.LoginResponse;
import com.vn.backend.entity.User;
import com.vn.backend.repository.PermissionRepository;
import com.vn.backend.repository.UserRepository;
import com.vn.backend.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PermissionRepository permissionRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public LoginResponse login(LoginRequest req) {
        User user = userRepository.findByUsernameOrEmail(req.usernameOrEmail())
                .orElseThrow(() -> new AppException(HttpStatus.UNAUTHORIZED, "Sai tài khoản"));

        if (Boolean.FALSE.equals(user.getIsActive())) {
            throw new AppException(HttpStatus.FORBIDDEN, "Tài khoản đã bị khóa");
        }

        if (user.getPasswordHash() == null || !passwordEncoder.matches(req.password(), user.getPasswordHash())) {
            throw new AppException(HttpStatus.UNAUTHORIZED, "Sai mật khẩu");
        }

        if (user.getRole() == null) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Tài khoản chưa được gán role");
        }

        String roleCode = user.getRole().getCode(); // ADMIN/SALE...
        List<String> perms = permissionRepository.findPermissionCodesByUserId(user.getId());

        String token = jwtService.generateToken(user.getId(), roleCode, perms);
        return new LoginResponse(token, roleCode, perms);
    }
}