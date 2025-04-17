package com.eng.service;

import com.eng.entities.Conversation;
import com.eng.models.response.ConversationResponse;

import java.util.List;
import java.util.UUID;

public interface ConversationService {
    List<ConversationResponse> getUserConversations();

    ConversationResponse createPrivateConversation(UUID userId2);

    ConversationResponse createGroupConversation(String name, List<UUID> participantIds);
    
    void updateLastMessage(UUID conversationId, UUID messageId);

    Conversation getConversation(UUID conversationId);
}
