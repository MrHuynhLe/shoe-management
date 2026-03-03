package com.vn.backend.dto.response;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class UserDetailResponse {

    private Long id;
    private String username;
    private String fullName;
    private String email;
    private String phone;
    private String address;
    private LocalDate birthday;
    private Double salary;
    private Long roleId;
    private Boolean isActive;
}