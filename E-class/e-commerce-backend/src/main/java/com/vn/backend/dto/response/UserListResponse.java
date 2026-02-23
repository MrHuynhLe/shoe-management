package com.vn.backend.dto.response;


import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.OffsetDateTime;

@Getter
@AllArgsConstructor
public class UserListResponse {

    private Long id;
    private String username;
    private String fullName;
    private String phone;
    private String roleName;
    private Boolean isActive;
    private OffsetDateTime deletedAt;
}