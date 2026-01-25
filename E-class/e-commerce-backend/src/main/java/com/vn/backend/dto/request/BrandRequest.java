
package com.vn.backend.dto.request;

import lombok.Data;

@Data
public class BrandRequest {
    private String name;
    private Boolean isActive = true;
}
