package com.eng.service.impl;

import com.eng.models.response.MessageResponse;
import com.eng.models.response.MessageStatusResponse;
import com.eng.models.response.MessageTypingResponse;
import com.eng.service.UserStatusService;
import com.eng.service.WebSocketService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class WebSocketServiceImpl implements WebSocketService {

    private final SimpMessagingTemplate messagingTemplate;

    private final UserStatusService userStatusService;
    private static final String CONVERSATION_TOPIC = "/topic/conversations/";
    private static final String USER_TOPIC = "/topic/user/";
    private static final String TYPING_DESTINATION = "/typing";
    private static final String STATUS_DESTINATION = "/status";

    @Override
    public void sendMessage(UUID conversationId, MessageResponse message) {
        String destination = CONVERSATION_TOPIC + conversationId;
        log.info("Sending message to conversation {}: {}", conversationId, message);
        messagingTemplate.convertAndSend(destination, message);
    }

    @Override
    public void notifyMessageDelivered(UUID conversationId, UUID messageId, UUID userId) {
        String destination = CONVERSATION_TOPIC + conversationId + STATUS_DESTINATION;
        String payload = String.format("{\"messageId\":\"%s\",\"userId\":\"%s\",\"status\":\"DELIVERED\"}",
                messageId, userId);
        log.info("Notifying message delivered: {}", payload);
        messagingTemplate.convertAndSend(destination, payload);
    }

    @Override
    public void notifyMessageRead(UUID conversationId, UUID messageId, UUID userId) {
        String destination = CONVERSATION_TOPIC + conversationId + STATUS_DESTINATION;
        String payload = String.format("{\"messageId\":\"%s\",\"userId\":\"%s\",\"status\":\"READ\"}",
                messageId, userId);
        log.info("Notifying message read: {}", payload);
        messagingTemplate.convertAndSend(destination, payload);
    }

    @Override
    public void notifyMessageReaction(UUID conversationId, UUID messageId, UUID userId, String reaction) {
        String destination = CONVERSATION_TOPIC + conversationId + STATUS_DESTINATION;
        String payload = String.format("{\"messageId\":\"%s\",\"userId\":\"%s\",\"reaction\":\"%s\"}",
                messageId, userId, reaction);
        log.info("Notifying message reaction: {}", payload);
        messagingTemplate.convertAndSend(destination, payload);
    }

    @Override
    public void notifyUserTyping(UUID conversationId, MessageTypingResponse messageTypingResponse) {
        String destination = CONVERSATION_TOPIC + conversationId + TYPING_DESTINATION;
        messagingTemplate.convertAndSend(destination, messageTypingResponse);
    }

    @Override
    public void notifyUserOnline(UUID userId) {
        String destination = USER_TOPIC + userId + STATUS_DESTINATION;
        userStatusService.userConnected(userId);
        messagingTemplate.convertAndSend(destination, MessageStatusResponse.builder().online(true).userId(userId).build());
    }

    @Override
    public void notifyUserOffline(UUID userId) {
        String destination = USER_TOPIC + userId + STATUS_DESTINATION;
        userStatusService.userDisconnected(userId);
        messagingTemplate.convertAndSend(destination, MessageStatusResponse.builder().online(false).userId(userId).build());
    }
} 