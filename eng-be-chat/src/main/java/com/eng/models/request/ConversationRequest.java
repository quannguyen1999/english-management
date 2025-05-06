package com.eng.models.request;

import lombok.Data;

import java.util.UUID;

@Data
public class ConversationRequest {
    private Integer page;

    private Integer size;

    private String username;

    private UUID conversationId;
} 