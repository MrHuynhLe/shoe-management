package com.vn.backend.dto.request.chatbot;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ChatbotAskRequest {

    @NotBlank(message = "Tin nhắn không được để trống")
    private String message;

    private Long conversationId;

    private String channel;
}