package com.vn.backend.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateUserStatusRequest {

    @NotNull(message = "Trạng thái không được rỗng")
    private Boolean isActive;
}