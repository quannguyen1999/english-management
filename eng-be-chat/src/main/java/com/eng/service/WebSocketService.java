package com.eng.service;

import com.eng.models.response.MessageResponse;
import com.eng.models.response.MessageTypingResponse;

import java.util.UUID;

public interface WebSocketService {
    void sendMessage(UUID conversationId, MessageResponse message);
    
    void notifyMessageDelivered(UUID conversationId, UUID messageId, UUID userId);
    
    void notifyMessageRead(UUID conversationId, UUID messageId, UUID userId);
    
    void notifyMessageReaction(UUID conversationId, UUID messageId, UUID userId, String reaction);

    void notifyUserTyping(UUID conversationId, MessageTypingResponse messageTypingResponse);
    
    void notifyUserOnline(UUID userId);
    
    void notifyUserOffline(UUID userId);
} 