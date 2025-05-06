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

import static com.eng.constants.PathApi.CONVERSATION;
import static com.eng.constants.PathApi.CONVERSATION_SOCKET_TYPING;

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
} 