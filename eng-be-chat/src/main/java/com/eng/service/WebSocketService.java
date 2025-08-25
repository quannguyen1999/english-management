package com.eng.service;

import java.util.UUID;

import com.eng.models.response.AudioCallResponse;
import com.eng.models.response.MessageResponse;
import com.eng.models.response.MessageTypingResponse;

public interface WebSocketService {
    void sendMessage(UUID conversationId, MessageResponse message);
    
    void notifyMessageDelivered(UUID conversationId, UUID messageId, UUID userId);
    
    void notifyMessageRead(UUID conversationId, UUID messageId, UUID userId);
    
    void notifyMessageReaction(UUID conversationId, UUID messageId, UUID userId, String reaction);

    void notifyUserTyping(UUID conversationId, MessageTypingResponse messageTypingResponse);
    
    void notifyUserOnline(UUID userId);
    
    void notifyUserOffline(UUID userId);
    
    // Audio call notification methods
    void notifyIncomingCall(UUID userId, AudioCallResponse audioCall);
    
    void notifyCallAccepted(UUID userId, AudioCallResponse audioCall);
    
    void notifyCallRejected(UUID userId, AudioCallResponse audioCall);
    
    void notifyCallEnded(UUID userId, AudioCallResponse audioCall);
    
    void notifyCallOffer(UUID userId, AudioCallResponse audioCall);
    
    void notifyCallAnswer(UUID userId, AudioCallResponse audioCall);
    
    void notifyIceCandidate(UUID userId, UUID callId, String iceCandidate);
} 