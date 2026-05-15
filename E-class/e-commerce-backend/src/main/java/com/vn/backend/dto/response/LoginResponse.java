package com.vn.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class LoginResponse {

    private String token;

    private Long userId;

    private String username;

    private String role;

    private Long employeeId;

}