package com.vn.backend.dto.response.chatbot;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatbotAskResponse {

    private Long conversationId;
    private String intent;
    private String answer;
    private List<String> suggestions;
}