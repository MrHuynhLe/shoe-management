package com.vn.backend.dto.request;

import lombok.Data;

import java.time.LocalDate;

@Data
public class UpdateUserRequest {

    private String email;
    private String fullName;
    private String phone;
    private String address;
    private LocalDate birthday;
    private Long roleId;
    private Double salary;
}