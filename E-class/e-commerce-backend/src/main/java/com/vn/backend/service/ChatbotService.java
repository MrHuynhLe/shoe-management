package com.vn.backend.service;

import com.vn.backend.dto.request.chatbot.ChatbotAskRequest;
import com.vn.backend.dto.response.chatbot.ChatMessageResponse;
import com.vn.backend.dto.response.chatbot.ChatbotAskResponse;
import com.vn.backend.security.CustomUserDetails;

import java.util.List;

public interface ChatbotService {

    ChatbotAskResponse ask(ChatbotAskRequest request, CustomUserDetails userDetails);

    List<ChatMessageResponse> getConversationMessages(Long conversationId, CustomUserDetails userDetails);
}