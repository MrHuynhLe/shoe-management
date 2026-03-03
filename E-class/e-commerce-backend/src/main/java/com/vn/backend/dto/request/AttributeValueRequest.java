package com.vn.backend.dto.request;


import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class AttributeValueRequest {

    @NotBlank(message = "value không được để trống")
    @Size(max = 255, message = "value tối đa 255 ký tự")
    private String value;
}