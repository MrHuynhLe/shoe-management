package com.vn.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ColorRequest {
    @NotBlank(message = "Tên màu không được để trống")
    private String value;
}