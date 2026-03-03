package com.vn.backend.dto.response;


import lombok.*;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttributeValueResponse {
    private Long id;
    private String value;
}