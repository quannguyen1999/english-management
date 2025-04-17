package com.eng.service;

import com.eng.constants.MessageType;
import com.eng.models.response.MessageResponse;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.util.UUID;

public interface WebSocketService {
    void sendMessage(UUID conversationId, MessageResponse message);
    
    void notifyMessageDelivered(UUID conversationId, UUID messageId, UUID userId);
    
    void notifyMessageRead(UUID conversationId, UUID messageId, UUID userId);
    
    void notifyMessageReaction(UUID conversationId, UUID messageId, UUID userId, String reaction);
    
    void notifyUserTyping(UUID conversationId, UUID userId);
    
    void notifyUserOnline(UUID userId);
    
    void notifyUserOffline(UUID userId);
} 