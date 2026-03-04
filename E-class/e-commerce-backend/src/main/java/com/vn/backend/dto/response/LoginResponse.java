package com.vn.backend.dto.response;

import java.util.List;

public record LoginResponse(
        String token,
        String role,
        List<String> permissions
) {}