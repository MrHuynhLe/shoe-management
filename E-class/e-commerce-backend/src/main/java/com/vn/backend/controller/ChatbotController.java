package com.vn.backend.controller;

import com.vn.backend.dto.request.chatbot.ChatbotAskRequest;
import com.vn.backend.dto.response.chatbot.ChatMessageResponse;
import com.vn.backend.dto.response.chatbot.ChatbotAskResponse;
import com.vn.backend.security.CustomUserDetails;
import com.vn.backend.service.ChatbotService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/v1/chatbot")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class ChatbotController {

    private final ChatbotService chatbotService;

    @PostMapping("/ask")
    public ResponseEntity<ChatbotAskResponse> ask(
            @Valid @RequestBody ChatbotAskRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        return ResponseEntity.ok(chatbotService.ask(request, userDetails));
    }

    @GetMapping("/conversations/{conversationId}/messages")
    public ResponseEntity<List<ChatMessageResponse>> getConversationMessages(
            @PathVariable Long conversationId,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        return ResponseEntity.ok(
                chatbotService.getConversationMessages(conversationId, userDetails)
        );
    }
}