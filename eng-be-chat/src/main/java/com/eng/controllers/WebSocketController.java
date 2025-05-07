package com.eng.controllers;

import com.eng.models.response.MessageTypingResponse;
import com.eng.service.WebSocketService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.UUID;

import static com.eng.constants.PathApi.*;

@Slf4j
@Controller
@RequiredArgsConstructor
public class WebSocketController {
    private final WebSocketService webSocketService;

    @MessageMapping(CONVERSATION + CONVERSATION_SOCKET_TYPING)
    public void handleTyping(@DestinationVariable UUID conversationId, @RequestBody MessageTypingResponse messageTypingResponse) {
        log.info("User {} is typing in conversation {}", messageTypingResponse.getUserId(), conversationId);
        webSocketService.notifyUserTyping(conversationId, messageTypingResponse);
    }

    @MessageMapping(CONVERSATION + CONVERSATION_SOCKET_STATUS_ONLINE)
    public void handleStatusOnline(@DestinationVariable UUID userId) {
        log.info("User {} is status online", userId);
        webSocketService.notifyUserOnline(userId);
    }

    @MessageMapping(CONVERSATION + CONVERSATION_SOCKET_STATUS_OFFLINE)
    public void handleStatusOffline(@DestinationVariable UUID userId) {
        log.info("User {} is status offline", userId);
        webSocketService.notifyUserOffline(userId);
    }
} 