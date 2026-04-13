package com.vn.backend.repository;

import com.vn.backend.entity.ChatConversation;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ChatConversationRepository extends JpaRepository<ChatConversation, Long> {
}