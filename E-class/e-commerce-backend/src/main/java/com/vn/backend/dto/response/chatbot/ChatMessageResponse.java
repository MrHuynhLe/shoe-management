package com.vn.backend.dto.response.chatbot;

import lombok.*;

import java.time.OffsetDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatMessageResponse {

    private Long id;
    private String senderType;
    private String messageText;
    private String intent;
    private OffsetDateTime createdAt;
}